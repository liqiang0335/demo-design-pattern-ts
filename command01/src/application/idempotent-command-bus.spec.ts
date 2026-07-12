import type { Command } from './command';
import type { CommandExecutor } from './command-executor';
import { CommandIdConflictError } from './errors/command-id-conflict.error';
import { IdempotentCommandBus } from './idempotent-command-bus';
import { InMemoryCommandExecutionRepository } from '../infrastructure/in-memory-command-execution.repository';

interface ExampleResult {
  readonly message: string;
}

/** 用于验证幂等装饰器的最小命令实现。 */
class ExampleCommand implements Command<ExampleResult> {
  public readonly type = 'example.idempotent.v1' as const;

  /** 创建携带请求身份的示例命令。 */
  public constructor(
    public readonly commandId: string,
    public readonly operatorId: string,
    public readonly payload = '默认载荷',
  ) { }
}

/** 用于验证命令 ID 复用冲突的另一种命令。 */
class AnotherCommand implements Command<ExampleResult> {
  public readonly type = 'example.another.v1' as const;

  /** 创建另一种类型的示例命令。 */
  public constructor(
    public readonly commandId: string,
    public readonly operatorId: string,
  ) { }
}

/** 记录执行次数的测试替身，模拟真实 CommandBus 委托的 Handler。 */
class CountingExecutor implements CommandExecutor {
  /** 被实际执行业务逻辑的次数。 */
  public executeCount = 0;

  /** 每次真实执行都产生递增结果，便于验证缓存结果是否被复用。 */
  public execute<TResult>(command: Command<TResult>): Promise<TResult> {
    this.executeCount += 1;
    return Promise.resolve({
      message: `${command.type}:${this.executeCount}`,
    } as TResult);
  }
}

describe('IdempotentCommandBus', () => {
  /** 验证重复 HTTP/MQ 投递只会进入一次实际业务执行。 */
  it('returns the first successful result without re-executing the command', async () => {
    const delegate = new CountingExecutor();
    const commandBus = new IdempotentCommandBus(
      delegate,
      new InMemoryCommandExecutionRepository(),
    );
    const command = new ExampleCommand('command-1', 'operator-1');

    const firstResult = await commandBus.execute(command);
    const repeatedResult = await commandBus.execute(command);

    expect(firstResult).toEqual({ message: 'example.idempotent.v1:1' });
    expect(repeatedResult).toEqual(firstResult);
    expect(delegate.executeCount).toBe(1);
  });

  /** 验证同一幂等键不能被另一种命令借用，避免返回错误请求的缓存结果。 */
  it('rejects a command id reused by a different command type', async () => {
    const commandBus = new IdempotentCommandBus(
      new CountingExecutor(),
      new InMemoryCommandExecutionRepository(),
    );

    await commandBus.execute(new ExampleCommand('command-1', 'operator-1'));

    await expect(
      commandBus.execute(new AnotherCommand('command-1', 'operator-1')),
    ).rejects.toBeInstanceOf(CommandIdConflictError);
  });

  /** 验证相同类型但不同业务参数也不能复用同一幂等键。 */
  it('rejects a command id reused with a different payload', async () => {
    const commandBus = new IdempotentCommandBus(
      new CountingExecutor(),
      new InMemoryCommandExecutionRepository(),
    );

    await commandBus.execute(
      new ExampleCommand('command-1', 'operator-1', '第一次请求'),
    );

    await expect(
      commandBus.execute(
        new ExampleCommand('command-1', 'operator-1', '被篡改的请求'),
      ),
    ).rejects.toBeInstanceOf(CommandIdConflictError);
  });
});
