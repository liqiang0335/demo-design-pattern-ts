import type { Order } from './order';
export interface OrderRepository {
    findById(orderId: string): Promise<Order | null>;
    save(order: Order): Promise<void>;
}
