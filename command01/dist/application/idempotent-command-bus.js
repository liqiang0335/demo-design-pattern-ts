"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotentCommandBus = void 0;
const command_fingerprint_1 = require("./command-fingerprint");
const command_already_processing_error_1 = require("./errors/command-already-processing.error");
const command_id_conflict_error_1 = require("./errors/command-id-conflict.error");
class IdempotentCommandBus {
    delegate;
    executionRepository;
    constructor(delegate, executionRepository) {
        this.delegate = delegate;
        this.executionRepository = executionRepository;
    }
    async execute(command) {
        const startResult = await this.executionRepository.tryStart({
            commandId: command.commandId,
            commandType: command.type,
            operatorId: command.operatorId,
            requestFingerprint: (0, command_fingerprint_1.createCommandFingerprint)(command),
        });
        if (startResult.kind === 'SUCCEEDED') {
            return startResult.result;
        }
        if (startResult.kind === 'PROCESSING') {
            throw new command_already_processing_error_1.CommandAlreadyProcessingError(command.commandId);
        }
        if (startResult.kind === 'CONFLICT') {
            throw new command_id_conflict_error_1.CommandIdConflictError(command.commandId);
        }
        try {
            const result = await this.delegate.execute(command);
            await this.executionRepository.markSucceeded(command.commandId, result);
            return result;
        }
        catch (error) {
            await this.executionRepository.markFailed(command.commandId, this.toErrorMessage(error));
            throw error;
        }
    }
    toErrorMessage(error) {
        return error instanceof Error ? error.message : '未知命令执行异常';
    }
}
exports.IdempotentCommandBus = IdempotentCommandBus;
//# sourceMappingURL=idempotent-command-bus.js.map