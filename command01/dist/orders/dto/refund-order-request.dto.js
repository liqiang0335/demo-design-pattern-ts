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
exports.RefundOrderRequestDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class RefundOrderRequestDto {
    amountInCents;
    reason;
}
exports.RefundOrderRequestDto = RefundOrderRequestDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'amountInCents 必须是整数分' }),
    (0, class_validator_1.Min)(1, { message: 'amountInCents 必须大于 0' }),
    (0, class_validator_1.Max)(Number.MAX_SAFE_INTEGER, {
        message: 'amountInCents 超出安全整数范围',
    }),
    __metadata("design:type", Number)
], RefundOrderRequestDto.prototype, "amountInCents", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)({ message: 'reason 必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'reason 不能为空' }),
    (0, class_validator_1.MaxLength)(500, { message: 'reason 长度不能超过 500' }),
    __metadata("design:type", String)
], RefundOrderRequestDto.prototype, "reason", void 0);
//# sourceMappingURL=refund-order-request.dto.js.map