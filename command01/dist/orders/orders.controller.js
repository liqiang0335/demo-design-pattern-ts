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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const cancel_order_command_1 = require("../application/commands/cancel-order.command");
const refund_order_command_1 = require("../application/commands/refund-order.command");
const tokens_1 = require("../application/tokens");
const command_metadata_decorator_1 = require("../interfaces/command-metadata.decorator");
const command_metadata_dto_1 = require("./dto/command-metadata.dto");
const cancel_order_request_dto_1 = require("./dto/cancel-order-request.dto");
const order_id_param_dto_1 = require("./dto/order-id-param.dto");
const refund_order_request_dto_1 = require("./dto/refund-order-request.dto");
const order_query_service_1 = require("./order-query.service");
const commandMetadataValidationPipe = new common_1.ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    validateCustomDecorators: true,
});
let OrdersController = class OrdersController {
    commandExecutor;
    orderQueryService;
    constructor(commandExecutor, orderQueryService) {
        this.commandExecutor = commandExecutor;
        this.orderQueryService = orderQueryService;
    }
    findById(params) {
        return this.orderQueryService.findById(params.orderId);
    }
    async cancel(params, metadata, request) {
        return this.commandExecutor.execute(new cancel_order_command_1.CancelOrderCommand(metadata.commandId, metadata.operatorId, params.orderId, request.reason));
    }
    async refund(params, metadata, request) {
        return this.commandExecutor.execute(new refund_order_command_1.RefundOrderCommand(metadata.commandId, metadata.operatorId, params.orderId, request.amountInCents, request.reason));
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(':orderId'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_id_param_dto_1.OrderIdParamDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(':orderId/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, command_metadata_decorator_1.CommandMetadata)(commandMetadataValidationPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_id_param_dto_1.OrderIdParamDto,
        command_metadata_dto_1.CommandMetadataDto,
        cancel_order_request_dto_1.CancelOrderRequestDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':orderId/refund'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, command_metadata_decorator_1.CommandMetadata)(commandMetadataValidationPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_id_param_dto_1.OrderIdParamDto,
        command_metadata_dto_1.CommandMetadataDto,
        refund_order_request_dto_1.RefundOrderRequestDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "refund", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __param(0, (0, common_1.Inject)(tokens_1.COMMAND_EXECUTOR)),
    __metadata("design:paramtypes", [Object, order_query_service_1.OrderQueryService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map