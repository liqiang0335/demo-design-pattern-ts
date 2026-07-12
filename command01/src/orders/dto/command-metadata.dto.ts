import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

/** HTTP 和 MQ 适配器转换为命令前必须具备的审计与幂等元数据。 */
export class CommandMetadataDto {
  /** 客户端为本次业务意图生成的 UUID v4 幂等键。 */
  @IsUUID('4', { message: 'x-command-id 必须是 UUID v4' })
  public commandId!: string;

  /** 操作人标识用于授权、审计以及防止跨操作人复用幂等键。 */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'x-operator-id 必须是字符串' })
  @IsNotEmpty({ message: 'x-operator-id 不能为空' })
  @MaxLength(100, { message: 'x-operator-id 长度不能超过 100' })
  public operatorId!: string;
}
