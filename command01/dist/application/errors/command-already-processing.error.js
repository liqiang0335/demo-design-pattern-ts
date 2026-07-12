"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandAlreadyProcessingError = void 0;
class CommandAlreadyProcessingError extends Error {
    constructor(commandId) {
        super(`命令仍在处理中：${commandId}`);
        this.name = CommandAlreadyProcessingError.name;
    }
}
exports.CommandAlreadyProcessingError = CommandAlreadyProcessingError;
//# sourceMappingURL=command-already-processing.error.js.map