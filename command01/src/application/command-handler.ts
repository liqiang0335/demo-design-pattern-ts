import type { Command } from './command';

/**
 * 一个 Handler 只处理一种明确的业务命令，并返回该命令声明的结果类型。
 * 泛型只负责编译期约束；运行时路由由 `commandType` 完成。
 */
export interface CommandHandler<TCommand extends Command<TResult>, TResult> {
  /** 与命令 `type` 完全一致的稳定 Token。 */
  readonly commandType: TCommand['type'];

  /**
   * 执行一个完整的业务动作。
   * 领域规则应委托给领域对象，Handler 只负责加载、编排和保存。
   */
  execute(command: TCommand): Promise<TResult>;
}
