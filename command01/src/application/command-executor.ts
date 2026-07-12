import type { Command } from './command';

/**
 * 对外暴露的命令执行边界。
 * Controller、消息消费者和定时任务依赖此接口，因此可以透明叠加幂等、审计等能力。
 */
export interface CommandExecutor {
  /** 根据命令的泛型结果类型，向调用方返回对应的强类型结果。 */
  execute<TResult>(command: Command<TResult>): Promise<TResult>;
}
