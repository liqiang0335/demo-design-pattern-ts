/** 已记录命令开始执行后的四种互斥结果。 */
export type CommandExecutionStartResult =
  | { readonly kind: 'STARTED' }
  | { readonly kind: 'SUCCEEDED'; readonly result: unknown }
  | { readonly kind: 'PROCESSING' }
  | {
    readonly kind: 'CONFLICT';
    readonly existingCommandType: string;
    readonly existingOperatorId: string;
  };

/**
 * 幂等记录的持久化端口。
 * 真实数据库实现必须让 tryStart 成为原子操作，例如以 commandId 的唯一索引配合事务或 upsert。
 */
export interface CommandExecutionRepository {
  /**
   * 原子地创建或读取命令执行记录。
   * 同一命令成功后返回缓存结果；失败记录可安全进入重试，由下游幂等键避免重复副作用。
   */
  tryStart(input: {
    commandId: string;
    commandType: string;
    operatorId: string;
    requestFingerprint: string;
  }): Promise<CommandExecutionStartResult>;

  /** 在 Handler 完整成功后持久化可复用的结果。 */
  markSucceeded(commandId: string, result: unknown): Promise<void>;

  /** 记录失败原因，让运维能够追踪本次未完成的执行。 */
  markFailed(commandId: string, errorMessage: string): Promise<void>;
}
