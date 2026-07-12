/**
 * CommandBus 收到未注册命令时抛出的应用层错误。
 * 它通常表示模块装配遗漏，而不是终端用户可以自行修复的输入问题。
 */
export class CommandHandlerNotFoundError extends Error {
  /** 创建包含稳定命令 Token 的诊断错误。 */
  public constructor(commandType: string) {
    super(`没有找到命令处理器：${commandType}`);
    this.name = CommandHandlerNotFoundError.name;
  }
}
