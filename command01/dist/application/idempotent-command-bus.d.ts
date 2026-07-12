import type { Command } from './command';
import type { CommandExecutionRepository } from './command-execution.repository';
import type { CommandExecutor } from './command-executor';
export declare class IdempotentCommandBus implements CommandExecutor {
    private readonly delegate;
    private readonly executionRepository;
    constructor(delegate: CommandExecutor, executionRepository: CommandExecutionRepository);
    execute<TResult>(command: Command<TResult>): Promise<TResult>;
    private toErrorMessage;
}
