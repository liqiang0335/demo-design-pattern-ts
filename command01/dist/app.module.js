"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const command_bus_1 = require("./application/command-bus");
const cancel_order_handler_1 = require("./application/commands/cancel-order.handler");
const refund_order_handler_1 = require("./application/commands/refund-order.handler");
const idempotent_command_bus_1 = require("./application/idempotent-command-bus");
const tokens_1 = require("./application/tokens");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const in_memory_command_execution_repository_1 = require("./infrastructure/in-memory-command-execution.repository");
const in_memory_inventory_service_1 = require("./infrastructure/in-memory-inventory.service");
const in_memory_order_repository_1 = require("./infrastructure/in-memory-order.repository");
const in_memory_payment_gateway_1 = require("./infrastructure/in-memory-payment.gateway");
const orders_controller_1 = require("./orders/orders.controller");
const order_query_service_1 = require("./orders/order-query.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [app_controller_1.AppController, orders_controller_1.OrdersController],
        providers: [
            app_service_1.AppService,
            order_query_service_1.OrderQueryService,
            cancel_order_handler_1.CancelOrderHandler,
            refund_order_handler_1.RefundOrderHandler,
            in_memory_order_repository_1.InMemoryOrderRepository,
            in_memory_inventory_service_1.InMemoryInventoryService,
            in_memory_payment_gateway_1.InMemoryPaymentGateway,
            in_memory_command_execution_repository_1.InMemoryCommandExecutionRepository,
            {
                provide: tokens_1.ORDER_REPOSITORY,
                useExisting: in_memory_order_repository_1.InMemoryOrderRepository,
            },
            {
                provide: tokens_1.INVENTORY_SERVICE,
                useExisting: in_memory_inventory_service_1.InMemoryInventoryService,
            },
            {
                provide: tokens_1.PAYMENT_GATEWAY,
                useExisting: in_memory_payment_gateway_1.InMemoryPaymentGateway,
            },
            {
                provide: tokens_1.COMMAND_EXECUTION_REPOSITORY,
                useExisting: in_memory_command_execution_repository_1.InMemoryCommandExecutionRepository,
            },
            {
                provide: command_bus_1.CommandBus,
                inject: [cancel_order_handler_1.CancelOrderHandler, refund_order_handler_1.RefundOrderHandler],
                useFactory: (cancelOrderHandler, refundOrderHandler) => {
                    const commandBus = new command_bus_1.CommandBus();
                    commandBus.register(cancelOrderHandler);
                    commandBus.register(refundOrderHandler);
                    return commandBus;
                },
            },
            {
                provide: tokens_1.COMMAND_EXECUTOR,
                inject: [command_bus_1.CommandBus, tokens_1.COMMAND_EXECUTION_REPOSITORY],
                useFactory: (commandBus, executionRepository) => new idempotent_command_bus_1.IdempotentCommandBus(commandBus, executionRepository),
            },
        ],
        exports: [tokens_1.COMMAND_EXECUTOR],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map