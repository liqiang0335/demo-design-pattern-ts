import type { Command } from './command';
import { CommandBus } from './command-bus';
import type { CommandHandler } from './command-handler';
import { CommandHandlerNotFoundError } from './errors/command-handler-not-found.error';

interface ExampleResult {
  value: string;
}

class ExampleCommand implements Command<ExampleResult> {
  public readonly type = 'example.execute.v1' as const;

  /** 构造一个用于验证总线路由的最小示例命令。 */
  public constructor(
    public readonly commandId: string,
    public readonly operatorId: string,
    public readonly value: string,
  ) { }
}

class ExampleHandler implements CommandHandler<ExampleCommand, ExampleResult> {
  public readonly commandType = 'example.execute.v1' as const;

  /** 记录调用次数，使测试能够确认总线只路由到已注册的 Handler。 */
  public executeCount = 0;

  /** 返回命令载荷，模拟真实 Handler 处理后产生的强类型结果。 */
  public execute(command: ExampleCommand): Promise<ExampleResult> {
    this.executeCount += 1;
    return Promise.resolve({ value: command.value });
  }
}

describe('CommandBus', () => {
  /** 验证稳定字符串 Token 能把命令准确路由到对应的 Handler。 */
  it('routes a command to its registered handler', async () => {
    const commandBus = new CommandBus();
    const handler = new ExampleHandler();
    commandBus.register(handler);

    const result = await commandBus.execute(
      new ExampleCommand('command-1', 'operator-1', '已处理'),
    );

    expect(result).toEqual({ value: '已处理' });
    expect(handler.executeCount).toBe(1);
  });

  /** 验证装配阶段能及早发现同一命令 Token 的重复注册。 */
  it('rejects duplicate handler registrations', () => {
    const commandBus = new CommandBus();
    commandBus.register(new ExampleHandler());

    expect(() => commandBus.register(new ExampleHandler())).toThrow(
      '命令处理器重复注册：example.execute.v1',
    );
  });

  /** 验证未知 Token 不会静默落入错误的业务处理器。 */
  it('reports an unregistered command type', async () => {
    const commandBus = new CommandBus();

    await expect(
      commandBus.execute(
        new ExampleCommand('command-1', 'operator-1', '未处理'),
      ),
    ).rejects.toBeInstanceOf(CommandHandlerNotFoundError);
  });
});
