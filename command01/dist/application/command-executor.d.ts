import type { Command } from './command';
export interface CommandExecutor {
    execute<TResult>(command: Command<TResult>): Promise<TResult>;
}
