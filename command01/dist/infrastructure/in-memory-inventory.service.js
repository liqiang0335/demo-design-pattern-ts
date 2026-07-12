"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryInventoryService = void 0;
const common_1 = require("@nestjs/common");
let InMemoryInventoryService = class InMemoryInventoryService {
    releasedRequestIds = new Set();
    release(input) {
        if (this.releasedRequestIds.has(input.requestId)) {
            return Promise.resolve();
        }
        this.releasedRequestIds.add(input.requestId);
        return Promise.resolve();
    }
};
exports.InMemoryInventoryService = InMemoryInventoryService;
exports.InMemoryInventoryService = InMemoryInventoryService = __decorate([
    (0, common_1.Injectable)()
], InMemoryInventoryService);
//# sourceMappingURL=in-memory-inventory.service.js.map