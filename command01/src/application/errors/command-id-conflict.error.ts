/**
 * 同一幂等键被不同命令类型或不同操作人复用时抛出的安全错误。
 * 这类请求不能返回缓存结果，否则可能跨越授权边界泄露结果。
 */
export class CommandIdConflictError extends Error {
  /** 创建包含命令 ID 的冲突错误。 */
  public constructor(commandId: string) {
    super(`命令 ID 被其他请求复用：${commandId}`);
    this.name = CommandIdConflictError.name;
  }
}
