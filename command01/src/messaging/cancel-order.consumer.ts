import { CancelOrderCommand } from '../application/commands/cancel-order.command';
import type { CommandExecutor } from '../application/command-executor';

/**
 * Broker 适配器完成反序列化和运行时校验后传入的取消订单消息。
 * eventId 直接复用为命令幂等键，使至少一次投递不会重复执行业务动作。
 */
export interface CancelOrderMessage {
  readonly eventId: string;
  readonly operatorId: string;
  readonly orderId: string;
  readonly reason: string;
}

/**
 * MQ 消费入口示例。
 * 它与 HTTP Controller 一样只做协议到 Command 的转换，不复制订单状态判断或库存释放逻辑。
 */
export class CancelOrderConsumer {
  /** 注入经过幂等装饰的命令执行边界。 */
  public constructor(private readonly commandExecutor: CommandExecutor) { }

  /**
   * 将一条已验证消息转为取消订单命令。
   * 使用 Kafka、RabbitMQ、SQS 等 Broker 时，只需由对应 SDK 调用本方法。
   */
  public async consume(message: CancelOrderMessage): Promise<void> {
    await this.commandExecutor.execute(
      new CancelOrderCommand(
        message.eventId,
        message.operatorId,
        message.orderId,
        message.reason,
      ),
    );
  }
}
