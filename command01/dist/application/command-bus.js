"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandBus = void 0;
const command_handler_not_found_error_1 = require("./errors/command-handler-not-found.error");
class CommandBus {
    handlers = new Map();
    register(handler) {
        if (this.handlers.has(handler.commandType)) {
            throw new Error(`命令处理器重复注册：${handler.commandType}`);
        }
        this.handlers.set(handler.commandType, handler);
    }
    async execute(command) {
        const handler = this.handlers.get(command.type);
        if (!handler) {
            throw new command_handler_not_found_error_1.CommandHandlerNotFoundError(command.type);
        }
        return handler.execute(command);
    }
}
exports.CommandBus = CommandBus;
//# sourceMappingURL=command-bus.js.map