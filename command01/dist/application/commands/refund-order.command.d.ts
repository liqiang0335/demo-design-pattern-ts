import type { Command } from '../command';
export interface RefundOrderResult {
    readonly commandId: string;
    readonly orderId: string;
    readonly refundId: string;
    readonly status: 'REFUNDED';
}
export declare class RefundOrderCommand implements Command<RefundOrderResult> {
    readonly commandId: string;
    readonly operatorId: string;
    readonly orderId: string;
    readonly amountInCents: number;
    readonly reason: string;
    readonly type: "order.refund.v1";
    constructor(commandId: string, operatorId: string, orderId: string, amountInCents: number, reason: string);
}
