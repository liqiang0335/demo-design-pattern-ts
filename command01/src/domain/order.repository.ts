import type { Order } from './order';

/**
 * 订单持久化端口。
 * 应用层只依赖该接口，后续可以将内存实现替换为 Prisma、TypeORM 或远程服务而不改 Handler。
 */
export interface OrderRepository {
  /** 按订单标识加载聚合根；不存在时返回 null。 */
  findById(orderId: string): Promise<Order | null>;

  /** 保存领域对象已经完成的状态转换。 */
  save(order: Order): Promise<void>;
}
