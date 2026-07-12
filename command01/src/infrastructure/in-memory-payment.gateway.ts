import { Injectable } from '@nestjs/common';
import type { PaymentGateway } from '../application/ports/payment-gateway';

/**
 * 支付网关的演示适配器。
 * 它以 refundRequestId 去重，模拟支付平台通常提供的退款幂等机制。
 */
@Injectable()
export class InMemoryPaymentGateway implements PaymentGateway {
  /** 以退款请求 ID 为键缓存支付平台已创建的退款单号。 */
  private readonly refundIds = new Map<string, string>();

  /** 用于生成演示退款单号的递增序列。 */
  private refundSequence = 0;

  /**
   * 模拟向支付平台提交退款并返回平台退款单号。
   * 同一退款请求 ID 再次抵达时，返回首次结果而不是创建第二笔退款。
   */
  public refund(input: {
    refundRequestId: string;
    paymentId: string;
    amountInCents: number;
    reason: string;
  }): Promise<{ refundId: string }> {
    const existingRefundId = this.refundIds.get(input.refundRequestId);

    if (existingRefundId) {
      return Promise.resolve({ refundId: existingRefundId });
    }

    this.refundSequence += 1;
    const refundId = `refund-${this.refundSequence}`;
    this.refundIds.set(input.refundRequestId, refundId);

    return Promise.resolve({ refundId });
  }
}
