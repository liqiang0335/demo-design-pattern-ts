import type { CommandHandler } from '../command-handler';
import type { InventoryService } from '../ports/inventory.service';
import type { OrderRepository } from '../../domain/order.repository';
import { CancelOrderCommand, type CancelOrderResult } from './cancel-order.command';
export declare class CancelOrderHandler implements CommandHandler<CancelOrderCommand, CancelOrderResult> {
    private readonly orderRepository;
    private readonly inventoryService;
    readonly commandType: "order.cancel.v1";
    constructor(orderRepository: OrderRepository, inventoryService: InventoryService);
    execute(command: CancelOrderCommand): Promise<CancelOrderResult>;
}
