import type { CommandExecutor } from '../application/command-executor';
import { CommandMetadataDto } from './dto/command-metadata.dto';
import { CancelOrderRequestDto } from './dto/cancel-order-request.dto';
import { OrderIdParamDto } from './dto/order-id-param.dto';
import { RefundOrderRequestDto } from './dto/refund-order-request.dto';
import { OrderQueryService, type OrderView } from './order-query.service';
export declare class OrdersController {
    private readonly commandExecutor;
    private readonly orderQueryService;
    constructor(commandExecutor: CommandExecutor, orderQueryService: OrderQueryService);
    findById(params: OrderIdParamDto): Promise<OrderView>;
    cancel(params: OrderIdParamDto, metadata: CommandMetadataDto, request: CancelOrderRequestDto): Promise<unknown>;
    refund(params: OrderIdParamDto, metadata: CommandMetadataDto, request: RefundOrderRequestDto): Promise<unknown>;
}
