import { Order } from '../domain/order';
import type { OrderRepository } from '../domain/order.repository';
export declare class InMemoryOrderRepository implements OrderRepository {
    private readonly snapshots;
    findById(orderId: string): Promise<Order | null>;
    save(order: Order): Promise<void>;
}
