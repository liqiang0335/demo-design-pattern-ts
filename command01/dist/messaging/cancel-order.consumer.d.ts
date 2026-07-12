import type { CommandExecutor } from '../application/command-executor';
export interface CancelOrderMessage {
    readonly eventId: string;
    readonly operatorId: string;
    readonly orderId: string;
    readonly reason: string;
}
export declare class CancelOrderConsumer {
    private readonly commandExecutor;
    constructor(commandExecutor: CommandExecutor);
    consume(message: CancelOrderMessage): Promise<void>;
}
