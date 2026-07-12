import type { PaymentGateway } from '../application/ports/payment-gateway';
export declare class InMemoryPaymentGateway implements PaymentGateway {
    private readonly refundIds;
    private refundSequence;
    refund(input: {
        refundRequestId: string;
        paymentId: string;
        amountInCents: number;
        reason: string;
    }): Promise<{
        refundId: string;
    }>;
}
