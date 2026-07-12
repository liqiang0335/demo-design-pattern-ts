import type { CommandExecutionRepository, CommandExecutionStartResult } from '../application/command-execution.repository';
export declare class InMemoryCommandExecutionRepository implements CommandExecutionRepository {
    private readonly records;
    tryStart(input: {
        commandId: string;
        commandType: string;
        operatorId: string;
        requestFingerprint: string;
    }): Promise<CommandExecutionStartResult>;
    markSucceeded(commandId: string, result: unknown): Promise<void>;
    markFailed(commandId: string, errorMessage: string): Promise<void>;
}
