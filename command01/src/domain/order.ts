import { DomainRuleViolationError } from './domain-rule-violation.error';

/** 订单允许进入的有限状态集合。 */
export type OrderStatus =
  'CREATED' | 'PAID' | 'SHIPPED' | 'CANCELLED' | 'REFUNDED';

/** 仓储持久化和重建订单时使用的纯数据快照。 */
export interface OrderSnapshot {
  readonly id: string;
  readonly status: OrderStatus;
  readonly totalAmountInCents: number;
  readonly paymentId?: string;
}

/**
 * 订单聚合根，集中维护取消和退款等状态转换规则。
 * 金额统一使用最小货币单位“分”，避免 JavaScript 浮点数参与支付金额计算。
 */
export class Order {
  /**
   * 创建或从持久化数据重建订单。
   * 即使数据来自仓储，仍校验金额不变量，防止损坏数据悄悄流入业务流程。
   */
  public constructor(
    public readonly id: string,
    private status: OrderStatus,
    public readonly totalAmountInCents: number,
    public readonly paymentId?: string,
  ) {
    if (!Number.isSafeInteger(totalAmountInCents) || totalAmountInCents <= 0) {
      throw new DomainRuleViolationError('订单总金额必须是大于 0 的整数分');
    }
  }

  /** 返回当前订单状态，同时保持状态字段只能由领域方法修改。 */
  public getStatus(): OrderStatus {
    return this.status;
  }

  /**
   * 取消尚未发货的订单。
   * 已发货、已取消和已退款订单不能再次取消，避免状态机出现非法回退。
   */
  public cancel(reason: string): void {
    if (!['CREATED', 'PAID'].includes(this.status)) {
      throw new DomainRuleViolationError(
        `当前订单状态不允许取消：${this.status}`,
      );
    }

    if (reason.trim().length === 0) {
      throw new DomainRuleViolationError('取消原因不能为空');
    }

    this.status = 'CANCELLED';
  }

  /**
   * 申请订单退款。
   * 先完成全部领域校验再转换状态，Handler 因此能在调用支付网关前拒绝非法退款。
   */
  public refund(amountInCents: number, reason: string): void {
    if (!['PAID', 'SHIPPED'].includes(this.status)) {
      throw new DomainRuleViolationError(
        `当前订单状态不允许退款：${this.status}`,
      );
    }

    if (!Number.isSafeInteger(amountInCents) || amountInCents <= 0) {
      throw new DomainRuleViolationError('退款金额必须是大于 0 的整数分');
    }

    if (amountInCents > this.totalAmountInCents) {
      throw new DomainRuleViolationError('退款金额不能超过订单金额');
    }

    if (reason.trim().length === 0) {
      throw new DomainRuleViolationError('退款原因不能为空');
    }

    this.status = 'REFUNDED';
  }

  /** 将领域对象转换为仓储可保存的纯数据结构。 */
  public toSnapshot(): OrderSnapshot {
    return {
      id: this.id,
      status: this.status,
      totalAmountInCents: this.totalAmountInCents,
      paymentId: this.paymentId,
    };
  }

  /**
   * 根据快照创建新的订单实例。
   * 仓储应返回新对象，避免 Handler 在保存前的状态变更直接污染内存中的持久化状态。
   */
  public static fromSnapshot(snapshot: OrderSnapshot): Order {
    return new Order(
      snapshot.id,
      snapshot.status,
      snapshot.totalAmountInCents,
      snapshot.paymentId,
    );
  }
}
