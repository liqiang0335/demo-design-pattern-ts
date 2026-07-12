"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderQueryService = void 0;
const common_1 = require("@nestjs/common");
const order_not_found_error_1 = require("../application/errors/order-not-found.error");
const tokens_1 = require("../application/tokens");
let OrderQueryService = class OrderQueryService {
    orderRepository;
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async findById(orderId) {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new order_not_found_error_1.OrderNotFoundError(orderId);
        }
        return {
            orderId: order.id,
            status: order.getStatus(),
            totalAmountInCents: order.totalAmountInCents,
            paymentId: order.paymentId,
        };
    }
};
exports.OrderQueryService = OrderQueryService;
exports.OrderQueryService = OrderQueryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.ORDER_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], OrderQueryService);
//# sourceMappingURL=order-query.service.js.map