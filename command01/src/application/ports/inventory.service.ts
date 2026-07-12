/**
 * 库存系统的应用层端口。
 * requestId 必须由下游作为幂等键处理，网络重试才不会重复释放库存。
 */
export interface InventoryService {
  /** 释放订单预占的库存。 */
  release(input: { orderId: string; requestId: string }): Promise<void>;
}
