import { Injectable } from '@nestjs/common';
import type { InventoryService } from '../application/ports/inventory.service';

/**
 * 库存服务的演示适配器。
 * 即便上游已有命令幂等，本适配器仍按 requestId 幂等，体现跨系统调用必须独立防重的原则。
 */
@Injectable()
export class InMemoryInventoryService implements InventoryService {
  /** 已被成功释放库存的下游请求 ID。 */
  private readonly releasedRequestIds = new Set<string>();

  /**
   * 模拟释放库存。
   * 真实实现应调用库存服务，并将 requestId 传入对方的幂等字段。
   */
  public release(input: { orderId: string; requestId: string }): Promise<void> {
    if (this.releasedRequestIds.has(input.requestId)) {
      return Promise.resolve();
    }

    this.releasedRequestIds.add(input.requestId);
    return Promise.resolve();
  }
}
