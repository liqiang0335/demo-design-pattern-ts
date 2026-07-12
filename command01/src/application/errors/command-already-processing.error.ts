/** 同一命令仍在执行时抛出的错误，调用方应在稍后查询结果或重试。 */
export class CommandAlreadyProcessingError extends Error {
  /** 创建包含幂等键的冲突错误。 */
  public constructor(commandId: string) {
    super(`命令仍在处理中：${commandId}`);
    this.name = CommandAlreadyProcessingError.name;
  }
}
