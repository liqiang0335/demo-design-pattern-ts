export type OrderStatus = 'CREATED' | 'PAID' | 'SHIPPED' | 'CANCELLED' | 'REFUNDED';
export interface OrderSnapshot {
    readonly id: string;
    readonly status: OrderStatus;
    readonly totalAmountInCents: number;
    readonly paymentId?: string;
}
export declare class Order {
    readonly id: string;
    private status;
    readonly totalAmountInCents: number;
    readonly paymentId?: string | undefined;
    constructor(id: string, status: OrderStatus, totalAmountInCents: number, paymentId?: string | undefined);
    getStatus(): OrderStatus;
    cancel(reason: string): void;
    refund(amountInCents: number, reason: string): void;
    toSnapshot(): OrderSnapshot;
    static fromSnapshot(snapshot: OrderSnapshot): Order;
}
