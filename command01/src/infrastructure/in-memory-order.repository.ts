import { Injectable } from '@nestjs/common';
import { Order, type OrderSnapshot } from '../domain/order';
import type { OrderRepository } from '../domain/order.repository';

/**
 * 用于演示应用的内存订单仓储。
 * 每次重新启动应用都会恢复种子订单；生产环境应以数据库适配器替换此实现。
 */
@Injectable()
export class InMemoryOrderRepository implements OrderRepository {
  /**
   * 使用快照而非领域对象保存数据。
   * 这样 Handler 拿到的是独立聚合实例，只有显式调用 save 才会提交状态变化。
   */
  private readonly snapshots = new Map<string, OrderSnapshot>([
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

  /** 根据 ID 重建订单聚合根；调用方无法直接修改内存中的持久化快照。 */
  public findById(orderId: string): Promise<Order | null> {
    const snapshot = this.snapshots.get(orderId);
    return Promise.resolve(snapshot ? Order.fromSnapshot(snapshot) : null);
  }

  /** 保存领域方法完成后的状态转换。 */
  public save(order: Order): Promise<void> {
    this.snapshots.set(order.id, order.toSnapshot());
    return Promise.resolve();
  }
}
