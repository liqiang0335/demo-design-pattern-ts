"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandMetadataDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CommandMetadataDto {
    commandId;
    operatorId;
}
exports.CommandMetadataDto = CommandMetadataDto;
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'x-command-id 必须是 UUID v4' }),
    __metadata("design:type", String)
], CommandMetadataDto.prototype, "commandId", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)({ message: 'x-operator-id 必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'x-operator-id 不能为空' }),
    (0, class_validator_1.MaxLength)(100, { message: 'x-operator-id 长度不能超过 100' }),
    __metadata("design:type", String)
], CommandMetadataDto.prototype, "operatorId", void 0);
//# sourceMappingURL=command-metadata.dto.js.map