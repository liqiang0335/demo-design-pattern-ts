"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderNotFoundError = void 0;
class OrderNotFoundError extends Error {
    constructor(orderId) {
        super(`订单不存在：${orderId}`);
        this.name = OrderNotFoundError.name;
    }
}
exports.OrderNotFoundError = OrderNotFoundError;
//# sourceMappingURL=order-not-found.error.js.map