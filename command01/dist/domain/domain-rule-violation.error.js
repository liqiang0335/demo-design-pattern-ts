"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainRuleViolationError = void 0;
class DomainRuleViolationError extends Error {
    constructor(message) {
        super(message);
        this.name = DomainRuleViolationError.name;
    }
}
exports.DomainRuleViolationError = DomainRuleViolationError;
//# sourceMappingURL=domain-rule-violation.error.js.map