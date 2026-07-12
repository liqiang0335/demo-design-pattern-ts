"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryOrderRepository = void 0;
const common_1 = require("@nestjs/common");
const order_1 = require("../domain/order");
let InMemoryOrderRepository = class InMemoryOrderRepository {
    snapshots = new Map([
        [
            'order-created-1001',
            {
                id: 'order-created-1001',
                status: 'CREATED',
                totalAmountInCents: 9900,
            },
        ],
        [
            'order-paid-1001',
            {
                id: 'order-paid-1001',
                status: 'PAID',
                totalAmountInCents: 19900,
                paymentId: 'payment-1001',
            },
        ],
        [
            'order-shipped-1001',
            {
                id: 'order-shipped-1001',
                status: 'SHIPPED',
                totalAmountInCents: 29900,
                paymentId: 'payment-1002',
            },
        ],
    ]);
    findById(orderId) {
        const snapshot = this.snapshots.get(orderId);
        return Promise.resolve(snapshot ? order_1.Order.fromSnapshot(snapshot) : null);
    }
    save(order) {
        this.snapshots.set(order.id, order.toSnapshot());
        return Promise.resolve();
    }
};
exports.InMemoryOrderRepository = InMemoryOrderRepository;
exports.InMemoryOrderRepository = InMemoryOrderRepository = __decorate([
    (0, common_1.Injectable)()
], InMemoryOrderRepository);
//# sourceMappingURL=in-memory-order.repository.js.map