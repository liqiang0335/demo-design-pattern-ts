import { Inject, Injectable } from '@nestjs/common';
import { OrderNotFoundError } from '../application/errors/order-not-found.error';
import { ORDER_REPOSITORY } from '../application/tokens';
import type { OrderRepository } from '../domain/order.repository';

/** 简单订单读取返回的数据形状。 */
export interface OrderView {
  readonly orderId: string;
  readonly status: string;
  readonly totalAmountInCents: number;
  readonly paymentId?: string;
}

/**
 * 查询是无副作用操作，因此不需要经过 CommandBus。
 * 该服务刻意展示：命令模式应用于业务动作，而非机械包装所有 Repository 调用。
 */
@Injectable()
export class OrderQueryService {
  /** 通过订单仓储读取聚合当前状态。 */
  public constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) { }

  /** 加载订单并转换为不会暴露领域对象可变性的只读 DTO。 */
  public async findById(orderId: string): Promise<OrderView> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    return {
      orderId: order.id,
      status: order.getStatus(),
      totalAmountInCents: order.totalAmountInCents,
      paymentId: order.paymentId,
    };
  }
}
