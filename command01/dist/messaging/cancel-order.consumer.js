"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelOrderConsumer = void 0;
const cancel_order_command_1 = require("../application/commands/cancel-order.command");
class CancelOrderConsumer {
    commandExecutor;
    constructor(commandExecutor) {
        this.commandExecutor = commandExecutor;
    }
    async consume(message) {
        await this.commandExecutor.execute(new cancel_order_command_1.CancelOrderCommand(message.eventId, message.operatorId, message.orderId, message.reason));
    }
}
exports.CancelOrderConsumer = CancelOrderConsumer;
//# sourceMappingURL=cancel-order.consumer.js.map