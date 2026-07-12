"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandIdConflictError = void 0;
class CommandIdConflictError extends Error {
    constructor(commandId) {
        super(`命令 ID 被其他请求复用：${commandId}`);
        this.name = CommandIdConflictError.name;
    }
}
exports.CommandIdConflictError = CommandIdConflictError;
//# sourceMappingURL=command-id-conflict.error.js.map