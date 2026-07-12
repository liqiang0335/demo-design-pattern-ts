import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** 取消订单接口的业务请求体。 */
export class CancelOrderRequestDto {
  /** 取消原因是领域规则的一部分，先在边界层限制格式与长度。 */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'reason 必须是字符串' })
  @IsNotEmpty({ message: 'reason 不能为空' })
  @MaxLength(500, { message: 'reason 长度不能超过 500' })
  public reason!: string;
}
