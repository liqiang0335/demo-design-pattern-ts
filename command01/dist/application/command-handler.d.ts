import type { Command } from './command';
export interface CommandHandler<TCommand extends Command<TResult>, TResult> {
    readonly commandType: TCommand['type'];
    execute(command: TCommand): Promise<TResult>;
}
