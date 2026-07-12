import type { Command } from '../command';

/** 退款成功后返回给调用方的数据。 */
export interface RefundOrderResult {
  readonly commandId: string;
  readonly orderId: string;
  readonly refundId: string;
  readonly status: 'REFUNDED';
}

/**
 * 退款订单这一业务动作的不可变输入。
 * amountInCents 的单位为“分”，例如 12.34 元传入 1234。
 */
export class RefundOrderCommand implements Command<RefundOrderResult> {
  public readonly type = 'order.refund.v1' as const;

  /** 创建一次包含退款金额、原因和操作人的退款命令。 */
  public constructor(
    public readonly commandId: string,
    public readonly operatorId: string,
    public readonly orderId: string,
    public readonly amountInCents: number,
    public readonly reason: string,
  ) { }
}
