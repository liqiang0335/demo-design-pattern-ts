# NestJS 命令模式订单示例

这是一个可运行的 NestJS 订单服务，用命令模式处理“取消订单”和“退款订单”两个具有不同输入、领域规则和下游依赖的业务动作。

示例刻意没有引入 `@nestjs/cqrs`：核心 `CommandBus` 只有少量代码，更容易看清 TypeScript 在运行时没有泛型和接口信息时，如何使用稳定字符串 Token 路由 Handler。业务层并不依赖 NestJS，因此同一个命令也能被 HTTP、消息消费者或定时任务调用。

## 运行

```bash
pnpm install
pnpm start:dev
```

服务默认监听 `http://localhost:3000`。

```bash
# 运行全部单元测试
pnpm test

# 运行 HTTP 端到端测试
pnpm test:e2e

# 编译检查
pnpm run build
```

## 可用接口

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/` | 返回服务说明 |
| `GET` | `/orders/:orderId` | 查询订单，读取操作不经过 CommandBus |
| `POST` | `/orders/:orderId/cancel` | 执行 `CancelOrderCommand` |
| `POST` | `/orders/:orderId/refund` | 执行 `RefundOrderCommand` |

两个写接口都要求以下请求头：

| 请求头 | 规则 | 用途 |
| --- | --- | --- |
| `x-command-id` | UUID v4 | 业务请求的幂等键 |
| `x-operator-id` | 非空字符串 | 审计、授权和幂等键隔离 |

内存仓储在每次重启时会初始化三笔订单：

| 订单 ID | 初始状态 | 场景 |
| --- | --- | --- |
| `order-created-1001` | `CREATED` | 可以取消 |
| `order-paid-1001` | `PAID` | 可以退款 |
| `order-shipped-1001` | `SHIPPED` | 不能取消，可用于观察领域错误 |

## 试用流程

先查询一笔待取消订单：

```bash
curl http://localhost:3000/orders/order-created-1001
```

取消订单。金额和状态判断不在 Controller 中，而由命令总线选中的 Handler 和领域对象完成：

```bash
curl -X POST http://localhost:3000/orders/order-created-1001/cancel \
  -H 'content-type: application/json' \
  -H 'x-command-id: 11111111-1111-4111-8111-111111111111' \
  -H 'x-operator-id: operator-1001' \
  -d '{"reason":"客户主动取消"}'
```

预期响应：

```json
{
  "commandId": "11111111-1111-4111-8111-111111111111",
  "orderId": "order-created-1001",
  "status": "CANCELLED"
}
```

使用完全相同的请求头和请求体再发一次请求，会返回首次成功结果，不会第二次释放库存。若复用同一个 `x-command-id` 却修改订单、操作人或业务参数，服务返回 `409 COMMAND_ID_CONFLICT`。

退款金额使用最小货币单位“分”，避免 JavaScript 浮点金额问题：

```bash
curl -X POST http://localhost:3000/orders/order-paid-1001/refund \
  -H 'content-type: application/json' \
  -H 'x-command-id: 22222222-2222-4222-8222-222222222222' \
  -H 'x-operator-id: operator-1001' \
  -d '{"amountInCents":9900,"reason":"部分退款"}'
```

## 执行链路

```text
HTTP Controller / MQ Consumer
            |
            v
      DTO 运行时校验
            |
            v
          Command
            |
            v
IdempotentCommandBus
            |
            v
        CommandBus
            |
            v
  专属 CommandHandler
            |
            v
领域模型 / 仓储端口 / 外部服务端口
```

关键职责如下：

| 位置 | 职责 |
| --- | --- |
| `src/application/command.ts` | 声明带稳定 `type`、幂等键和操作人的命令契约 |
| `src/application/command-bus.ts` | 使用字符串 Token 路由异构 Handler，将类型断言限制在总线内部 |
| `src/application/idempotent-command-bus.ts` | 通过命令 ID 和完整载荷 SHA-256 指纹统一处理幂等 |
| `src/application/commands` | 每个动作各有命令和 Handler；取消与退款参数不会互相污染 |
| `src/domain/order.ts` | 集中管理订单状态机、退款金额和取消原因等领域规则 |
| `src/infrastructure` | 当前的内存仓储、库存、支付和执行记录适配器 |
| `src/orders/orders.controller.ts` | 只做 HTTP 输入到 Command 的转换，不包含业务分支 |
| `src/messaging/cancel-order.consumer.ts` | 演示 MQ 入口复用相同命令与业务 Handler |

## 为什么使用字符串 Token

TypeScript 的接口和泛型会在运行时被擦除；类名也会因重构、压缩或反序列化而失去稳定性。因此命令自行声明版本化 Token：

```ts
public readonly type = 'order.cancel.v1' as const;
```

该 Token 可以安全地写入消息、Outbox 表或审计日志。`CommandBus` 用它查找 Handler，而调用方仍能从 `Command<TResult>` 获得结果类型推导。

## 幂等与跨系统调用

`IdempotentCommandBus` 负责进程内的命令执行记录：

1. 首次请求原子地创建 `PROCESSING` 记录。
2. 成功后缓存结果；同一完整请求直接返回该结果。
3. 正在执行的相同请求返回 `409 COMMAND_IN_PROGRESS`。
4. 同一命令 ID 但类型、操作人或载荷不同，返回 `409 COMMAND_ID_CONFLICT`。
5. 失败请求记录错误后允许重试；库存和支付端口同时接收命令 ID 作为自己的下游幂等键。

当前实现是单进程演示用内存存储。生产环境必须将 `CommandExecutionRepository` 替换为数据库实现，并为 `commandId` 添加唯一索引，使 `tryStart` 在多实例部署时仍是原子操作。

数据库事务不能回滚已经成功的支付或库存 HTTP 调用。真正的支付场景还需要根据业务风险配合 Transactional Outbox、Saga、补偿命令、重试队列和死信队列。命令模式解决的是业务动作建模、路由与横切能力组合，不替代分布式一致性方案。

## 扩展方式

新增一个动作时，按以下顺序扩展即可：

1. 在 `src/application/commands` 定义带版本化 `type` 的 Command 和结果类型。
2. 编写只处理该 Command 的 Handler，在其中加载领域对象、调用领域方法并保存。
3. 在 `AppModule` 中注册 Handler 到 `CommandBus`。
4. 为 HTTP、MQ 或定时任务写一个薄适配器，把外部输入验证后转换为 Command。
5. 为 Handler 和入口适配器补充聚焦测试。

由于入口只依赖 `CommandExecutor`，还可以以装饰器方式在 `IdempotentCommandBus` 外侧增加审计、授权、日志、指标或分布式追踪，而不污染每一个 Handler。