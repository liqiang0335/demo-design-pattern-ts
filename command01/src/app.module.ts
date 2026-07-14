import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommandBus } from './application/command-bus';
import type { CommandExecutionRepository } from './application/command-execution.repository';
import type { CommandExecutor } from './application/command-executor';
import { CancelOrderHandler } from './application/commands/cancel-order.handler';
import { RefundOrderHandler } from './application/commands/refund-order.handler';
import { IdempotentCommandBus } from './application/idempotent-command-bus';
import { COMMAND_EXECUTION_REPOSITORY, COMMAND_EXECUTOR, INVENTORY_SERVICE, ORDER_REPOSITORY, PAYMENT_GATEWAY } from './domain/tokens';
import { InMemoryCommandExecutionRepository } from './infrastructure/in-memory-command-execution.repository';
import { InMemoryInventoryService } from './infrastructure/in-memory-inventory.service';
import { InMemoryOrderRepository } from './infrastructure/in-memory-order.repository';
import { InMemoryPaymentGateway } from './infrastructure/in-memory-payment.gateway';
import { OrderQueryService } from './orders/order-query.service';
import { OrdersController } from './orders/orders.controller';

/**
 * 将 NestJS 基础设施与框架无关的应用层组装在一起。
 * 生产环境只需替换 Symbol Token 对应的适配器，不需要修改 Controller、Command 或 Handler。
 */
@Module({
  imports: [],
  controllers: [AppController, OrdersController],
  providers: [
    AppService,
    OrderQueryService,
    CancelOrderHandler,
    RefundOrderHandler,
    InMemoryOrderRepository,
    InMemoryInventoryService,
    InMemoryPaymentGateway,
    InMemoryCommandExecutionRepository,
    // 接口在运行时不存在，使用 Symbol Token 将端口绑定到演示基础设施适配器。
    { provide: ORDER_REPOSITORY, useExisting: InMemoryOrderRepository },
    { provide: INVENTORY_SERVICE, useExisting: InMemoryInventoryService, },
    { provide: PAYMENT_GATEWAY, useExisting: InMemoryPaymentGateway, },
    { provide: COMMAND_EXECUTION_REPOSITORY, useExisting: InMemoryCommandExecutionRepository, },
    // Handler 注册只在应用启动时进行，重复 Token 会立即让模块装配失败。
    {
      provide: CommandBus,
      inject: [CancelOrderHandler, RefundOrderHandler],
      useFactory: (cancelOrderHandler: CancelOrderHandler, refundOrderHandler: RefundOrderHandler,): CommandBus => {
        const commandBus = new CommandBus();
        commandBus.register(cancelOrderHandler);
        commandBus.register(refundOrderHandler);
        return commandBus;
      },
    },
    // Controller 依赖经过幂等装饰的执行器，业务 Handler 无需重复编写幂等逻辑。
    {
      provide: COMMAND_EXECUTOR,
      inject: [CommandBus, COMMAND_EXECUTION_REPOSITORY],
      useFactory: (commandBus: CommandBus, executionRepository: CommandExecutionRepository): CommandExecutor =>
        new IdempotentCommandBus(commandBus, executionRepository),
    },
  ],
  exports: [COMMAND_EXECUTOR],
})
export class AppModule { }
