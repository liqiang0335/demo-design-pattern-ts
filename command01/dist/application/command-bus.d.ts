import type { Command } from './command';
import type { CommandExecutor } from './command-executor';
import type { CommandHandler } from './command-handler';
export declare class CommandBus implements CommandExecutor {
    private readonly handlers;
    register<TResult, TCommand extends Command<TResult>>(handler: CommandHandler<TCommand, TResult>): void;
    execute<TResult>(command: Command<TResult>): Promise<TResult>;
}
