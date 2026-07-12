import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { CommandAlreadyProcessingError } from '../application/errors/command-already-processing.error';
import { CommandHandlerNotFoundError } from '../application/errors/command-handler-not-found.error';
import { CommandIdConflictError } from '../application/errors/command-id-conflict.error';
import { OrderNotFoundError } from '../application/errors/order-not-found.error';
import { DomainRuleViolationError } from '../domain/domain-rule-violation.error';

/**
 * 将应用层和领域层的已知错误转换为稳定的 HTTP 响应。
 * 领域与应用代码不依赖 HttpException，从而仍可供 MQ 消费者等其他入口复用。
 */
@Catch(
  DomainRuleViolationError,
  OrderNotFoundError,
  CommandAlreadyProcessingError,
  CommandIdConflictError,
  CommandHandlerNotFoundError,
)
export class BusinessExceptionFilter implements ExceptionFilter {
  /**
   * 根据错误类别选择语义化状态码，并返回可供客户端程序处理的稳定错误码。
   */
  public catch(exception: Error, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const mappedError = this.mapError(exception);

    response.status(mappedError.statusCode).json({
      statusCode: mappedError.statusCode,
      error: mappedError.error,
      message: exception.message,
    });
  }

  /** 将领域和应用异常映射为 HTTP 协议语义，不让 Controller 承担条件分支。 */
  private mapError(exception: Error): {
    statusCode: number;
    error: string;
  } {
    if (exception instanceof OrderNotFoundError) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'ORDER_NOT_FOUND',
      };
    }

    if (exception instanceof DomainRuleViolationError) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'DOMAIN_RULE_VIOLATION',
      };
    }

    if (exception instanceof CommandAlreadyProcessingError) {
      return {
        statusCode: HttpStatus.CONFLICT,
        error: 'COMMAND_IN_PROGRESS',
      };
    }

    if (exception instanceof CommandIdConflictError) {
      return {
        statusCode: HttpStatus.CONFLICT,
        error: 'COMMAND_ID_CONFLICT',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'COMMAND_HANDLER_CONFIGURATION_ERROR',
    };
  }
}
