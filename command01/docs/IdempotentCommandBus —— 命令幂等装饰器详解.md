

## 先理解一个问题：为什么需要 Symbol Token？

`CommandExecutor` 和 `CommandExecutionRepository` 都是 TypeScript **接口（interface）**——它们在编译成 JS 后会被完全擦除。NestJS 的依赖注入是运行时的，它需要一个**能保留到 JS 中的东西**来做"钥匙"。Class 可以用自身当钥匙，但接口不行。所以用 `Symbol`：

```typescript
// tokens.ts
export const COMMAND_EXECUTOR = Symbol('COMMAND_EXECUTOR');
export const COMMAND_EXECUTION_REPOSITORY = Symbol('COMMAND_EXECUTION_REPOSITORY');
```

---

## 装配链条：从混凝土类到 Controller

整个装配分四层，我按"钥匙 → 实物"的对应关系画出来：

```
┌─────────────────────────────────────────────────────────────────┐
│  钥匙 (Provider Token)          实物 (实际注入的对象)              │
├─────────────────────────────────────────────────────────────────┤
│  InMemoryOrderRepository        new InMemoryOrderRepository()    │  ← NestJS 自动 new
│  ORDER_REPOSITORY ──useExisting──→ 复用上面的实例                  │  ← Symbol 别名
│                                                                  │
│  InMemoryCommandExecutionRepo   new InMemory...Repository()      │
│  COMMAND_EXECUTION_REPOSITORY ──useExisting──→ 复用上面的实例      │
│                                                                  │
│  CancelOrderHandler             new CancelOrderHandler(...)      │  ← NestJS 自动 new
│  RefundOrderHandler             new RefundOrderHandler(...)      │
│                                                                  │
│  CommandBus ──useFactory──→     手动 new + register(handlers)     │  ← 需要初始化逻辑
│                                                                  │
│  COMMAND_EXECUTOR ──useFactory──→ new IdempotentCommandBus(       │  ← 装饰器组装
│                                   commandBus, executionRepo)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 逐步解析

### 第 1 步：基础设施实例（NestJS 自动创建）

```typescript
providers: [
    InMemoryOrderRepository,       // NestJS: "哦，这是一个 class，我 new 一个"
    InMemoryInventoryService,      // 同上
    InMemoryPaymentGateway,        // 同上
    InMemoryCommandExecutionRepository,  // 同上
]
```

这四行是最简单的——NestJS 看到 class，就用 `new` 创建一个单例放到容器里。此时容器的钥匙就是类本身。

### 第 2 步：Symbol 别名（`useExisting`）——给接口一个"运行时名字"

```typescript
{ provide: ORDER_REPOSITORY,           useExisting: InMemoryOrderRepository },
{ provide: INVENTORY_SERVICE,          useExisting: InMemoryInventoryService },
{ provide: PAYMENT_GATEWAY,            useExisting: InMemoryPaymentGateway },
{ provide: COMMAND_EXECUTION_REPOSITORY, useExisting: InMemoryCommandExecutionRepository },
```

`useExisting` 的意思是："当有人问我要钥匙 `COMMAND_EXECUTION_REPOSITORY` 时，把容器里已有的 `InMemoryCommandExecutionRepository` 的同一个实例给他。"

为什么要绕这一下？因为 Handler 和 IdempotentCommandBus 的构造函数里用的是 **Symbol Token**（接口），不是具体类名：

```typescript
// CancelOrderHandler 内部，它通过 Symbol 拿到仓储，不依赖具体实现
@Injectable()
class CancelOrderHandler {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly orderRepo: OrderRepository  // ← 接口，不是 InMemoryOrderRepository
  ) {}
}
```

这样换数据库时，只改这一行 `useExisting`，Handler 代码不动。

### 第 3 步：组装 CommandBus（`useFactory`）——需要"初始化"的复杂对象

```typescript
{
  provide: CommandBus,                              // 钥匙：CommandBus 类本身
  inject: [CancelOrderHandler, RefundOrderHandler],  // 告诉 NestJS："先创建这两个，传给我"
  useFactory: (cancel, refund) => {
    const bus = new CommandBus();   // 手动 new
    bus.register(cancel);           // 注册 Handler
    bus.register(refund);           // 注册 Handler
    return bus;                     // 返回组装好的总线
  },
},
```

这里不能用 `useExisting` 或自动创建，因为 `CommandBus` 需要**注册 Handler 后才能用**。`useFactory` 就是"给我写一段自定义的 new 逻辑"。

NestJS 执行顺序：
1. 先创建 `CancelOrderHandler` 和 `RefundOrderHandler`（它们的依赖 `ORDER_REPOSITORY` 等已被第 2 步解决）
2. 把两个 Handler 实例传入 factory 函数
3. factory 返回的 `CommandBus` 实例存入容器

### 第 4 步：组装装饰器（`useFactory`）——把两样东西拼在一起

```typescript
{
  provide: COMMAND_EXECUTOR,                          // 钥匙：Symbol
  inject: [CommandBus, COMMAND_EXECUTION_REPOSITORY], // 依赖：总线 + 执行记录仓储
  useFactory: (commandBus, executionRepo) =>
    new IdempotentCommandBus(commandBus, executionRepo),  // 装饰！
},
```

这里做的事情：
1. 从容器里拿出第 3 步组装好的 `CommandBus`
2. 从容器里拿出第 2 步绑定的 `InMemoryCommandExecutionRepository`（通过 Symbol 别名）
3. 用这两样东西 `new IdempotentCommandBus(bus, repo)`
4. 把这个装饰后的对象存在 `COMMAND_EXECUTOR` 这把钥匙下

### 第 5 步：Controller 拿到最终对象

```typescript
// orders.controller.ts
@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(COMMAND_EXECUTOR)                         // 问容器要钥匙 COMMAND_EXECUTOR
    private readonly commandExecutor: CommandExecutor, // 拿到的实际是 IdempotentCommandBus 实例！
  ) {}
}
```

Controller 的代码只知道 `CommandExecutor` 接口，完全不知道有装饰器的存在。

---

## 完整的数据流（一个请求的生命周期）

```
HTTP POST /orders/123/cancel
        │
        ▼
OrdersController.cancel()
        │  构造 CancelOrderCommand{ commandId, operatorId, orderId, reason }
        │  调用 this.commandExecutor.execute(command)
        │                 │
        │                 ▼  这里拿到的其实是 IdempotentCommandBus
        │        ┌─────────────────────────────────────┐
        │        │  IdempotentCommandBus.execute()     │
        │        │                                     │
        │        │  1. executionRepository.tryStart()  │  ← 查/写执行记录
        │        │     ├─ SUCCEEDED → 直接返回缓存结果   │
        │        │     ├─ PROCESSING → 抛错             │
        │        │     ├─ CONFLICT → 抛错               │
        │        │     └─ STARTED → 继续 ↓              │
        │        │                                     │
        │        │  2. delegate.execute(command)        │  ← 这是真正的 CommandBus
        │        │           │                          │
        │        │           ▼                          │
        │        │     CommandBus.execute()             │
        │        │       查找 handler(command.type)     │
        │        │       → CancelOrderHandler.execute() │  ← 业务逻辑！
        │        │                                     │
        │        │  3. markSucceeded() / markFailed()   │  ← 写回结果
        │        └─────────────────────────────────────┘
        │
        ▼
  返回结果给 HTTP 调用方
```

---

## 关键总结

| 语法 | 作用 | 本项目中的用途 |
|---|---|---|
| `providers: [ClassName]` | NestJS 自动 `new` 单例 | 基础设施类（InMemoryXxx） |
| `{ provide: SYMBOL, useExisting: Class }` | 给接口创建 Symbol 别名 | 让 Handler 依赖接口而非具体类 |
| `{ provide: X, useFactory: (...) => {...}, inject: [...] }` | 手动控制创建逻辑 | 需要 register 的 CommandBus、需要装饰的 IdempotentCommandBus |
| `@Inject(SYMBOL)` | 用 Symbol 从容器取值 | Controller 拿到 COMMAND_EXECUTOR |

核心思想：**Controller 不知道什么"幂等"、Handler 不知道什么"幂等"——它们各自只做自己的事。幂等这一横切关注点被集中在 `IdempotentCommandBus` + app.module.ts 的装配代码里。**