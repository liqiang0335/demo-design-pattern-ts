"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandlerNotFoundError = void 0;
class CommandHandlerNotFoundError extends Error {
    constructor(commandType) {
        super(`没有找到命令处理器：${commandType}`);
        this.name = CommandHandlerNotFoundError.name;
    }
}
exports.CommandHandlerNotFoundError = CommandHandlerNotFoundError;
//# sourceMappingURL=command-handler-not-found.error.js.map