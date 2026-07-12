/** 订单仓储未找到目标聚合根时抛出的应用层错误。 */
export class OrderNotFoundError extends Error {
  /** 创建包含订单 ID 的错误，方便接口层映射为 404 响应。 */
  public constructor(orderId: string) {
    super(`订单不存在：${orderId}`);
    this.name = OrderNotFoundError.name;
  }
}
