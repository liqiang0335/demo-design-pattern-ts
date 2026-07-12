export interface PaymentGateway {
    refund(input: {
        refundRequestId: string;
        paymentId: string;
        amountInCents: number;
        reason: string;
    }): Promise<{
        refundId: string;
    }>;
}
