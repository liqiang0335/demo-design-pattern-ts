import type { Command } from '../command';

/** 取消订单成功后返回给 HTTP 或消息调用方的数据。 */
export interface CancelOrderResult {
  readonly commandId: string;
  readonly orderId: string;
  readonly status: 'CANCELLED';
}

/**
 * 取消订单这一业务动作的不可变输入。
 * 该字符串 Token 可以安全写入 Outbox、MQ 或审计表，不受类名重构影响。
 */
export class CancelOrderCommand implements Command<CancelOrderResult> {
  public readonly type = 'order.cancel.v1' as const;

  /** 创建一次包含审计信息和业务参数的取消订单命令。 */
  public constructor(
    public readonly commandId: string,
    public readonly operatorId: string,
    public readonly orderId: string,
    public readonly reason: string,
  ) { }
}
