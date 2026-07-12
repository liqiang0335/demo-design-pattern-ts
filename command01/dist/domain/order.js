"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const domain_rule_violation_error_1 = require("./domain-rule-violation.error");
class Order {
    id;
    status;
    totalAmountInCents;
    paymentId;
    constructor(id, status, totalAmountInCents, paymentId) {
        this.id = id;
        this.status = status;
        this.totalAmountInCents = totalAmountInCents;
        this.paymentId = paymentId;
        if (!Number.isSafeInteger(totalAmountInCents) || totalAmountInCents <= 0) {
            throw new domain_rule_violation_error_1.DomainRuleViolationError('订单总金额必须是大于 0 的整数分');
        }
    }
    getStatus() {
        return this.status;
    }
    cancel(reason) {
        if (!['CREATED', 'PAID'].includes(this.status)) {
            throw new domain_rule_violation_error_1.DomainRuleViolationError(`当前订单状态不允许取消：${this.status}`);
        }
        if (reason.trim().length === 0) {
            throw new domain_rule_violation_error_1.DomainRuleViolationError('取消原因不能为空');
        }
        this.status = 'CANCELLED';
    }
    refund(amountInCents, reason) {
        if (!['PAID', 'SHIPPED'].includes(this.status)) {
            throw new domain_rule_violation_error_1.DomainRuleViolationError(`当前订单状态不允许退款：${this.status}`);
        }
        if (!Number.isSafeInteger(amountInCents) || amountInCents <= 0) {
            throw new domain_rule_violation_error_1.DomainRuleViolationError('退款金额必须是大于 0 的整数分');
        }
        if (amountInCents > this.totalAmountInCents) {
            throw new domain_rule_violation_error_1.DomainRuleViolationError('退款金额不能超过订单金额');
        }
        if (reason.trim().length === 0) {
            throw new domain_rule_violation_error_1.DomainRuleViolationError('退款原因不能为空');
        }
        this.status = 'REFUNDED';
    }
    toSnapshot() {
        return {
            id: this.id,
            status: this.status,
            totalAmountInCents: this.totalAmountInCents,
            paymentId: this.paymentId,
        };
    }
    static fromSnapshot(snapshot) {
        return new Order(snapshot.id, snapshot.status, snapshot.totalAmountInCents, snapshot.paymentId);
    }
}
exports.Order = Order;
//# sourceMappingURL=order.js.map