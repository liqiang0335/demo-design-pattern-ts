/**
 * 支付平台的应用层端口。
 * `refundRequestId` 由命令 ID 传入，支付平台应依据它实现外部幂等。
 */
export interface PaymentGateway {
  /** 发起或获取一次退款请求的结果。 */
  refund(input: {
    refundRequestId: string;
    paymentId: string;
    amountInCents: number;
    reason: string;
  }): Promise<{ refundId: string }>;
}
