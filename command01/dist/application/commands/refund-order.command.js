"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundOrderCommand = void 0;
class RefundOrderCommand {
    commandId;
    operatorId;
    orderId;
    amountInCents;
    reason;
    type = 'order.refund.v1';
    constructor(commandId, operatorId, orderId, amountInCents, reason) {
        this.commandId = commandId;
        this.operatorId = operatorId;
        this.orderId = orderId;
        this.amountInCents = amountInCents;
        this.reason = reason;
    }
}
exports.RefundOrderCommand = RefundOrderCommand;
//# sourceMappingURL=refund-order.command.js.map