export type CommandExecutionStartResult = {
    readonly kind: 'STARTED';
} | {
    readonly kind: 'SUCCEEDED';
    readonly result: unknown;
} | {
    readonly kind: 'PROCESSING';
} | {
    readonly kind: 'CONFLICT';
    readonly existingCommandType: string;
    readonly existingOperatorId: string;
};
export interface CommandExecutionRepository {
    tryStart(input: {
        commandId: string;
        commandType: string;
        operatorId: string;
        requestFingerprint: string;
    }): Promise<CommandExecutionStartResult>;
    markSucceeded(commandId: string, result: unknown): Promise<void>;
    markFailed(commandId: string, errorMessage: string): Promise<void>;
}
