import type { CommandHandler } from '../command-handler';
import type { PaymentGateway } from '../ports/payment-gateway';
import type { OrderRepository } from '../../domain/order.repository';
import { RefundOrderCommand, type RefundOrderResult } from './refund-order.command';
export declare class RefundOrderHandler implements CommandHandler<RefundOrderCommand, RefundOrderResult> {
    private readonly orderRepository;
    private readonly paymentGateway;
    readonly commandType: "order.refund.v1";
    constructor(orderRepository: OrderRepository, paymentGateway: PaymentGateway);
    execute(command: RefundOrderCommand): Promise<RefundOrderResult>;
}
