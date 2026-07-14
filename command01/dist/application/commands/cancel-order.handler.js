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
exports.CancelOrderHandler = void 0;
const common_1 = require("@nestjs/common");
const order_not_found_error_1 = require("../errors/order-not-found.error");
const tokens_1 = require("../tokens");
let CancelOrderHandler = class CancelOrderHandler {
    orderRepository;
    inventoryService;
    commandType = 'order.cancel.v1';
    constructor(orderRepository, inventoryService) {
        this.orderRepository = orderRepository;
        this.inventoryService = inventoryService;
    }
    async execute(command) {
        const order = await this.orderRepository.findById(command.orderId);
        if (!order) {
            throw new order_not_found_error_1.OrderNotFoundError(command.orderId);
        }
        order.cancel(command.reason);
        await this.inventoryService.release({
            orderId: order.id,
            requestId: command.commandId,
        });
        await this.orderRepository.save(order);
        return {
            commandId: command.commandId,
            orderId: order.id,
            status: 'CANCELLED',
        };
    }
};
exports.CancelOrderHandler = CancelOrderHandler;
exports.CancelOrderHandler = CancelOrderHandler = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.ORDER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.INVENTORY_SERVICE)),
    __metadata("design:paramtypes", [Object, Object])
], CancelOrderHandler);
//# sourceMappingURL=cancel-order.handler.js.map