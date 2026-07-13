import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, ValidationPipe } from '@nestjs/common';
import { CancelOrderCommand } from '../application/commands/cancel-order.command';
import { RefundOrderCommand } from '../application/commands/refund-order.command';
import type { CommandExecutor } from '../application/command-executor';
import { COMMAND_EXECUTOR } from '../domain/tokens';
import { CommandMetadata } from '../interfaces/command-metadata.decorator';
import { CommandMetadataDto } from './dto/command-metadata.dto';
import { CancelOrderRequestDto } from './dto/cancel-order-request.dto';
import { OrderIdParamDto } from './dto/order-id-param.dto';
import { RefundOrderRequestDto } from './dto/refund-order-request.dto';
import { OrderQueryService, type OrderView } from './order-query.service';

/**
 * 自定义参数装饰器不会可靠地自动使用全局校验管道，因此在路由参数上显式复用该 Pipe。
 * 选项与全局边界保持一致，确保 HTTP 请求头也在构造 Command 前完成校验。
 */
const commandMetadataValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  validateCustomDecorators: true,
});

/**
 * HTTP 协议适配器。
 * Controller 仅负责验证输入和构造 Command；业务规则、Handler 选择与幂等逻辑均由下游完成。
 */
@Controller('orders')
export class OrdersController {
  /** 依赖统一命令执行入口与无副作用的查询服务。 */
  public constructor(
    @Inject(COMMAND_EXECUTOR)
    private readonly commandExecutor: CommandExecutor,
    private readonly orderQueryService: OrderQueryService,
  ) { }

  /**
   * 查询当前订单状态。
   * 查询不产生副作用，直接使用 QueryService，而不人为包装成 Command。
   */
  @Get(':orderId')
  public findById(@Param() params: OrderIdParamDto): Promise<OrderView> {
    return this.orderQueryService.findById(params.orderId);
  }

  /**
   * 将取消订单 HTTP 请求转换为 CancelOrderCommand。
   * 相同的命令对象也可以由 MQ Consumer 或定时任务构造并发送给同一个执行入口。
   */
  @Post(':orderId/cancel')
  @HttpCode(HttpStatus.OK)
  public async cancel(
    @Param() params: OrderIdParamDto,
    @CommandMetadata(commandMetadataValidationPipe)
    metadata: CommandMetadataDto,
    @Body() request: CancelOrderRequestDto,
  ) {
    return this.commandExecutor.execute(
      new CancelOrderCommand(
        metadata.commandId,
        metadata.operatorId,
        params.orderId,
        request.reason,
      ),
    );
  }

  /**
   * 将退款 HTTP 请求转换为 RefundOrderCommand。
   * 退款金额和原因只属于退款动作，不会污染取消订单的请求模型。
   */
  @Post(':orderId/refund')
  @HttpCode(HttpStatus.OK)
  public async refund(
    @Param() params: OrderIdParamDto,
    @CommandMetadata(commandMetadataValidationPipe)
    metadata: CommandMetadataDto,
    @Body() request: RefundOrderRequestDto,
  ) {
    return this.commandExecutor.execute(
      new RefundOrderCommand(
        metadata.commandId,
        metadata.operatorId,
        params.orderId,
        request.amountInCents,
        request.reason,
      ),
    );
  }
}
