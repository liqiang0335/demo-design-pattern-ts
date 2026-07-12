/**
 * 所有业务命令的最小契约。
 *
 * `type` 是跨进程、跨版本仍可识别的稳定运行时 Token；不能依赖 TypeScript
 * 接口或类名，因为它们在编译、压缩或反序列化后都不具备可靠的运行时语义。
 */
export interface Command<TResult> {
  /** 命令类型，例如 `order.cancel.v1`。 */
  readonly type: string;

  /** 调用方生成的全局唯一幂等键。 */
  readonly commandId: string;

  /** 发起业务动作的操作人，用于审计与授权。 */
  readonly operatorId: string;

  /**
   * 仅在编译期关联命令与结果类型的可选标记。
   * 具体命令无需创建该字段，因此不会出现在运行时对象、指纹或序列化消息中。
   */
  readonly resultType?: TResult;
}
