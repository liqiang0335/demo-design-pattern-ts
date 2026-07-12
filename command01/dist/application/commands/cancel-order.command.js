"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelOrderCommand = void 0;
class CancelOrderCommand {
    commandId;
    operatorId;
    orderId;
    reason;
    type = 'order.cancel.v1';
    constructor(commandId, operatorId, orderId, reason) {
        this.commandId = commandId;
        this.operatorId = operatorId;
        this.orderId = orderId;
        this.reason = reason;
    }
}
exports.CancelOrderCommand = CancelOrderCommand;
//# sourceMappingURL=cancel-order.command.js.map