import type { InventoryService } from '../application/ports/inventory.service';
export declare class InMemoryInventoryService implements InventoryService {
    private readonly releasedRequestIds;
    release(input: {
        orderId: string;
        requestId: string;
    }): Promise<void>;
}
