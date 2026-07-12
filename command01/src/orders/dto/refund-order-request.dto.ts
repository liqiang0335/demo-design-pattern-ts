import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** 退款订单接口的业务请求体，金额统一以最小货币单位“分”传递。 */
export class RefundOrderRequestDto {
  /**
   * 退款金额（分）。
   * 限制为安全整数范围内的正数，实际是否超过订单总额由领域对象继续验证。
   */
  @Type(() => Number)
  @IsInt({ message: 'amountInCents 必须是整数分' })
  @Min(1, { message: 'amountInCents 必须大于 0' })
  @Max(Number.MAX_SAFE_INTEGER, {
    message: 'amountInCents 超出安全整数范围',
  })
  public amountInCents!: number;

  /** 退款原因会同时传给支付平台，需在入口限制为非空短文本。 */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'reason 必须是字符串' })
  @IsNotEmpty({ message: 'reason 不能为空' })
  @MaxLength(500, { message: 'reason 长度不能超过 500' })
  public reason!: string;
}
