import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** 所有订单路由共用的路径参数 DTO。 */
export class OrderIdParamDto {
  /** 订单 ID 可以是数据库 UUID 或业务可读编号，因此只限制为非空短字符串。 */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'orderId 必须是字符串' })
  @IsNotEmpty({ message: 'orderId 不能为空' })
  @MaxLength(100, { message: 'orderId 长度不能超过 100' })
  public orderId!: string;
}
