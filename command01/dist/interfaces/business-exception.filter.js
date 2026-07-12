"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const command_already_processing_error_1 = require("../application/errors/command-already-processing.error");
const command_handler_not_found_error_1 = require("../application/errors/command-handler-not-found.error");
const command_id_conflict_error_1 = require("../application/errors/command-id-conflict.error");
const order_not_found_error_1 = require("../application/errors/order-not-found.error");
const domain_rule_violation_error_1 = require("../domain/domain-rule-violation.error");
let BusinessExceptionFilter = class BusinessExceptionFilter {
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        const mappedError = this.mapError(exception);
        response.status(mappedError.statusCode).json({
            statusCode: mappedError.statusCode,
            error: mappedError.error,
            message: exception.message,
        });
    }
    mapError(exception) {
        if (exception instanceof order_not_found_error_1.OrderNotFoundError) {
            return {
                statusCode: common_1.HttpStatus.NOT_FOUND,
                error: 'ORDER_NOT_FOUND',
            };
        }
        if (exception instanceof domain_rule_violation_error_1.DomainRuleViolationError) {
            return {
                statusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                error: 'DOMAIN_RULE_VIOLATION',
            };
        }
        if (exception instanceof command_already_processing_error_1.CommandAlreadyProcessingError) {
            return {
                statusCode: common_1.HttpStatus.CONFLICT,
                error: 'COMMAND_IN_PROGRESS',
            };
        }
        if (exception instanceof command_id_conflict_error_1.CommandIdConflictError) {
            return {
                statusCode: common_1.HttpStatus.CONFLICT,
                error: 'COMMAND_ID_CONFLICT',
            };
        }
        return {
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'COMMAND_HANDLER_CONFIGURATION_ERROR',
        };
    }
};
exports.BusinessExceptionFilter = BusinessExceptionFilter;
exports.BusinessExceptionFilter = BusinessExceptionFilter = __decorate([
    (0, common_1.Catch)(domain_rule_violation_error_1.DomainRuleViolationError, order_not_found_error_1.OrderNotFoundError, command_already_processing_error_1.CommandAlreadyProcessingError, command_id_conflict_error_1.CommandIdConflictError, command_handler_not_found_error_1.CommandHandlerNotFoundError)
], BusinessExceptionFilter);
//# sourceMappingURL=business-exception.filter.js.map