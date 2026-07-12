/**
 * 领域对象发现业务不变量被破坏时抛出的错误。
 * 该错误不依赖 NestJS，以便相同领域模型可被 HTTP、MQ 或批处理任务复用。
 */
export class DomainRuleViolationError extends Error {
  /** 创建包含可读业务原因的领域错误。 */
  public constructor(message: string) {
    super(message);
    this.name = DomainRuleViolationError.name;
  }
}
