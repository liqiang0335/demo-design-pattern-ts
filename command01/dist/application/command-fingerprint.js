"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommandFingerprint = createCommandFingerprint;
const crypto_1 = require("crypto");
function createCommandFingerprint(command) {
    return (0, crypto_1.createHash)('sha256').update(stableSerialize(command)).digest('hex');
}
function stableSerialize(value) {
    if (value === null) {
        return 'null';
    }
    if (typeof value === 'string' || typeof value === 'boolean') {
        return JSON.stringify(value);
    }
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            throw new Error('命令载荷不能包含非有限数字');
        }
        return JSON.stringify(value);
    }
    if (typeof value === 'undefined') {
        return 'undefined';
    }
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
    }
    if (typeof value === 'object') {
        const entries = Object.entries(value)
            .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
            .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`);
        return `{${entries.join(',')}}`;
    }
    throw new Error('命令载荷只能包含 JSON 基础数据');
}
//# sourceMappingURL=command-fingerprint.js.map