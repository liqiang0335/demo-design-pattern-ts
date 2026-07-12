import { Inject, Injectable } from '@nestjs/common';
import type { CommandHandler } from '../command-handler';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import type { PaymentGateway } from '../ports/payment-gateway';
import { ORDER_REPOSITORY, PAYMENT_GATEWAY } from '../tokens';
import { DomainRuleViolationError } from '../../domain/domain-rule-violation.error';
import type { OrderRepository } from '../../domain/order.repository';
import {
  RefundOrderCommand,
  type RefundOrderResult,
} from './refund-order.command';

/**
 * 退款订单的应用服务。
 * 与取消 Handler 分离后，退款特有的金额与支付流水校验不会污染其他业务动作。
 */
@Injectable()
export class RefundOrderHandler implements CommandHandler<
  RefundOrderCommand,
  RefundOrderResult
> {
  public readonly commandType = 'order.refund.v1' as const;

  /** 通过端口依赖订单仓储和支付网关，而非依赖具体基础设施实现。 */
  public constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGateway,
  ) { }

  /**
   * 先由领域对象验证退款资格，再调用支付网关，最后保存新状态。
   * 真实项目还应通过 Outbox 或 Saga 处理“支付成功但数据库保存失败”的跨系统一致性问题。
   */
  public async execute(
    command: RefundOrderCommand,
  ): Promise<RefundOrderResult> {
    const order = await this.orderRepository.findById(command.orderId);

    if (!order) {
      throw new OrderNotFoundError(command.orderId);
    }

    if (!order.paymentId) {
      throw new DomainRuleViolationError(
        `订单不存在支付流水号：${command.orderId}`,
      );
    }

    // 在发生不可逆的支付调用前完成本地金额和状态校验。
    order.refund(command.amountInCents, command.reason);

    const refund = await this.paymentGateway.refund({
      refundRequestId: command.commandId,
      paymentId: order.paymentId,
      amountInCents: command.amountInCents,
      reason: command.reason,
    });

    await this.orderRepository.save(order);

    return {
      commandId: command.commandId,
      orderId: order.id,
      refundId: refund.refundId,
      status: 'REFUNDED',
    };
  }
}
