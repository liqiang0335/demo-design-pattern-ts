import { Inject, Injectable } from '@nestjs/common';
import type { OrderRepository } from '../../domain/order.repository';
import type { CommandHandler } from '../command-handler';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import type { InventoryService } from '../ports/inventory.service';
import { INVENTORY_SERVICE, ORDER_REPOSITORY } from '../tokens';
import { CancelOrderCommand, type CancelOrderResult, } from './cancel-order.command';

/**
 * 取消订单的应用服务。
 * Handler 负责编排仓储、领域对象和下游库存服务，不在 Controller 中散落业务流程。
 */
@Injectable()
export class CancelOrderHandler implements CommandHandler<CancelOrderCommand, CancelOrderResult> {
  public readonly commandType = 'order.cancel.v1' as const;

  /** 通过 Symbol Token 注入运行时不存在的 TypeScript 接口。 */
  public constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(INVENTORY_SERVICE)
    private readonly inventoryService: InventoryService,
  ) { }

  /**
   * 加载订单、执行状态转换、释放库存，再保存变更。
   * 命令 ID 同时传入库存系统，使下游调用具备独立的幂等保障。
   */
  public async execute(command: CancelOrderCommand): Promise<CancelOrderResult> {
    const order = await this.orderRepository.findById(command.orderId);

    if (!order) {
      throw new OrderNotFoundError(command.orderId);
    }

    // 仓储返回独立聚合实例，因此库存调用失败时本次状态不会被保存。
    order.cancel(command.reason);

    await this.inventoryService.release({
      orderId: order.id,
      requestId: command.commandId,
    });

    await this.orderRepository.save(order);

    return {
      commandId: command.commandId,
      orderId: order.id,
      status: 'CANCELLED',
    };
  }
}
