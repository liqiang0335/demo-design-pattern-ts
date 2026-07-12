import type { Command } from '../command';
export interface CancelOrderResult {
    readonly commandId: string;
    readonly orderId: string;
    readonly status: 'CANCELLED';
}
export declare class CancelOrderCommand implements Command<CancelOrderResult> {
    readonly commandId: string;
    readonly operatorId: string;
    readonly orderId: string;
    readonly reason: string;
    readonly type: "order.cancel.v1";
    constructor(commandId: string, operatorId: string, orderId: string, reason: string);
}
