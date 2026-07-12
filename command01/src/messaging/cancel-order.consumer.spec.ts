import type { Command } from '../application/command';
import { CancelOrderCommand } from '../application/commands/cancel-order.command';
import type { CommandExecutor } from '../application/command-executor';
import { CancelOrderConsumer } from './cancel-order.consumer';

/** 记录消息消费者提交的命令，用于验证适配器不会自行执行业务逻辑。 */
class CapturingCommandExecutor implements CommandExecutor {
  /** 最近收到的命令，初始为空。 */
  public receivedCommand: Command<unknown> | null = null;

  /** 保存命令并返回占位结果，模拟真实 CommandBus 的调用边界。 */
  public execute<TResult>(command: Command<TResult>): Promise<TResult> {
    this.receivedCommand = command;
    return Promise.resolve(undefined as TResult);
  }
}

describe('CancelOrderConsumer', () => {
  /** 验证消息字段会被完整映射到与 HTTP 共用的取消订单命令。 */
  it('maps a broker message to CancelOrderCommand', async () => {
    const commandExecutor = new CapturingCommandExecutor();
    const consumer = new CancelOrderConsumer(commandExecutor);

    await consumer.consume({
      eventId: '11111111-1111-4111-8111-111111111111',
      operatorId: 'operator-1001',
      orderId: 'order-created-1001',
      reason: '仓储事件要求取消',
    });

    expect(commandExecutor.receivedCommand).toBeInstanceOf(CancelOrderCommand);
    expect(commandExecutor.receivedCommand).toMatchObject({
      commandId: '11111111-1111-4111-8111-111111111111',
      operatorId: 'operator-1001',
      orderId: 'order-created-1001',
      reason: '仓储事件要求取消',
      type: 'order.cancel.v1',
    });
  });
});
