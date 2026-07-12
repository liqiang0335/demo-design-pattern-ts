export interface InventoryService {
    release(input: {
        orderId: string;
        requestId: string;
    }): Promise<void>;
}
