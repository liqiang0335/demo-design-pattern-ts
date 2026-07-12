import type { Command } from './command';
import type { CommandExecutionRepository } from './command-execution.repository';
import type { CommandExecutor } from './command-executor';
import { createCommandFingerprint } from './command-fingerprint';
import { CommandAlreadyProcessingError } from './errors/command-already-processing.error';
import { CommandIdConflictError } from './errors/command-id-conflict.error';

/**
 * 为任意 CommandExecutor 增加服务端幂等能力的装饰器。
 * 它把“重复请求”这一横切问题从每个 Handler 中移除，Handler 仍只描述业务动作。
 */
export class IdempotentCommandBus implements CommandExecutor {
  /**
   * 组合真正负责路由的总线和记录执行状态的仓储。
   * 两个依赖都是接口，因此该装饰器不依赖 NestJS 或具体数据库。
   */
  public constructor(
    private readonly delegate: CommandExecutor,
    private readonly executionRepository: CommandExecutionRepository,
  ) { }

  /**
   * 原子申请命令执行权：成功结果直接复用，进行中的请求拒绝，首次或失败重试才委托给 Handler。
   */
  public async execute<TResult>(command: Command<TResult>): Promise<TResult> {
    const startResult = await this.executionRepository.tryStart({
      commandId: command.commandId,
      commandType: command.type,
      operatorId: command.operatorId,
      requestFingerprint: createCommandFingerprint(command),
    });

    if (startResult.kind === 'SUCCEEDED') {
      // 结果来自同一命令 ID 的成功记录，断言集中在幂等边界内。
      return startResult.result as TResult;
    }

    if (startResult.kind === 'PROCESSING') {
      throw new CommandAlreadyProcessingError(command.commandId);
    }

    if (startResult.kind === 'CONFLICT') {
      throw new CommandIdConflictError(command.commandId);
    }

    try {
      const result = await this.delegate.execute(command);
      await this.executionRepository.markSucceeded(command.commandId, result);
      return result;
    } catch (error) {
      await this.executionRepository.markFailed(
        command.commandId,
        this.toErrorMessage(error),
      );
      throw error;
    }
  }

  /** 将任意抛出值规范成可安全存储和展示的失败信息。 */
  private toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : '未知命令执行异常';
  }
}
