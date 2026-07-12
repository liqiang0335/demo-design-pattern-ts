"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryPaymentGateway = void 0;
const common_1 = require("@nestjs/common");
let InMemoryPaymentGateway = class InMemoryPaymentGateway {
    refundIds = new Map();
    refundSequence = 0;
    refund(input) {
        const existingRefundId = this.refundIds.get(input.refundRequestId);
        if (existingRefundId) {
            return Promise.resolve({ refundId: existingRefundId });
        }
        this.refundSequence += 1;
        const refundId = `refund-${this.refundSequence}`;
        this.refundIds.set(input.refundRequestId, refundId);
        return Promise.resolve({ refundId });
    }
};
exports.InMemoryPaymentGateway = InMemoryPaymentGateway;
exports.InMemoryPaymentGateway = InMemoryPaymentGateway = __decorate([
    (0, common_1.Injectable)()
], InMemoryPaymentGateway);
//# sourceMappingURL=in-memory-payment.gateway.js.map