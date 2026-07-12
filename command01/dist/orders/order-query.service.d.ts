import type { OrderRepository } from '../domain/order.repository';
export interface OrderView {
    readonly orderId: string;
    readonly status: string;
    readonly totalAmountInCents: number;
    readonly paymentId?: string;
}
export declare class OrderQueryService {
    private readonly orderRepository;
    constructor(orderRepository: OrderRepository);
    findById(orderId: string): Promise<OrderView>;
}
