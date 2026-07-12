"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCommandExecutionRepository = void 0;
const common_1 = require("@nestjs/common");
let InMemoryCommandExecutionRepository = class InMemoryCommandExecutionRepository {
    records = new Map();
    tryStart(input) {
        const existingRecord = this.records.get(input.commandId);
        if (!existingRecord) {
            this.records.set(input.commandId, {
                commandType: input.commandType,
                operatorId: input.operatorId,
                requestFingerprint: input.requestFingerprint,
                status: 'PROCESSING',
            });
            return Promise.resolve({ kind: 'STARTED' });
        }
        if (existingRecord.commandType !== input.commandType ||
            existingRecord.operatorId !== input.operatorId ||
            existingRecord.requestFingerprint !== input.requestFingerprint) {
            return Promise.resolve({
                kind: 'CONFLICT',
                existingCommandType: existingRecord.commandType,
                existingOperatorId: existingRecord.operatorId,
            });
        }
        if (existingRecord.status === 'SUCCEEDED') {
            return Promise.resolve({
                kind: 'SUCCEEDED',
                result: existingRecord.result,
            });
        }
        if (existingRecord.status === 'PROCESSING') {
            return Promise.resolve({ kind: 'PROCESSING' });
        }
        existingRecord.status = 'PROCESSING';
        existingRecord.errorMessage = undefined;
        return Promise.resolve({ kind: 'STARTED' });
    }
    markSucceeded(commandId, result) {
        const record = this.records.get(commandId);
        if (!record) {
            return Promise.reject(new Error(`命令执行记录不存在：${commandId}`));
        }
        record.status = 'SUCCEEDED';
        record.result = result;
        return Promise.resolve();
    }
    markFailed(commandId, errorMessage) {
        const record = this.records.get(commandId);
        if (!record) {
            return Promise.reject(new Error(`命令执行记录不存在：${commandId}`));
        }
        record.status = 'FAILED';
        record.errorMessage = errorMessage;
        return Promise.resolve();
    }
};
exports.InMemoryCommandExecutionRepository = InMemoryCommandExecutionRepository;
exports.InMemoryCommandExecutionRepository = InMemoryCommandExecutionRepository = __decorate([
    (0, common_1.Injectable)()
], InMemoryCommandExecutionRepository);
//# sourceMappingURL=in-memory-command-execution.repository.js.map