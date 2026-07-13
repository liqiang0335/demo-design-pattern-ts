import type { Command } from './command';
import type { CommandExecutor } from './command-executor';
import type { CommandHandler } from './command-handler';
import { CommandHandlerNotFoundError } from './errors/command-handler-not-found.error';

/**
 * 异构 Handler 集合在运行时只能以统一类型存放。
 * 不安全的类型转换被限制在 CommandBus 内部，调用方仍能得到完整的结果类型推导。
 */
type UnknownCommand = Command<unknown>;
type UnknownCommandHandler = CommandHandler<UnknownCommand, unknown>;

/**
 * 使用显式字符串 Token 路由命令的轻量总线。
 *
 * 该实现不依赖 NestJS，因此应用层可以复用于 HTTP、MQ 消费者或定时任务。
 */
export class CommandBus implements CommandExecutor {
  private readonly handlers = new Map<string, UnknownCommandHandler>();

  /**
   * 注册一个命令处理器。
   * 同一 Token 对应多个 Handler 会导致行为不确定，因此启动阶段立即失败。
   */
  public register<TResult, TCommand extends Command<TResult>>(handler: CommandHandler<TCommand, TResult>,): void {
    if (this.handlers.has(handler.commandType)) {
      throw new Error(`命令处理器重复注册：${handler.commandType}`);
    }

    // Map 可以容纳不同命令和结果类型的 Handler，类型信息会在 execute 的泛型边界恢复。
    this.handlers.set(handler.commandType, handler);
  }

  /**
   * 通过命令的稳定 Token 查找 Handler，并保留调用方声明的结果类型。
   */
  public async execute<TResult>(command: Command<TResult>): Promise<TResult> {
    const handler = this.handlers.get(command.type);

    if (!handler) {
      throw new CommandHandlerNotFoundError(command.type);
    }

    // Handler 已在注册时按 Token 绑定；这里将运行时异构集合恢复为调用方的 TResult。
    return handler.execute(command) as Promise<TResult>;
  }
}
