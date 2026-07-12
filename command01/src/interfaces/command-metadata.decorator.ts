import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * 请求头刚被提取时的原始形状。
 * 字段允许缺失，随后由路由参数上的 ValidationPipe 转换并拒绝不合法请求。
 */
interface RawCommandMetadata {
  readonly commandId?: string;
  readonly operatorId?: string;
}

/**
 * 从 HTTP 请求头构造命令通用元数据。
 * 控制器参数声明为 CommandMetadataDto 后，应用配置的全局 ValidationPipe 会校验该对象。
 */
export const CommandMetadata = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RawCommandMetadata => {
    const request = context.switchToHttp().getRequest<Request>();

    return {
      commandId: getSingleHeaderValue(request.headers['x-command-id']),
      operatorId: getSingleHeaderValue(request.headers['x-operator-id']),
    };
  },
);

/**
 * HTTP 协议允许同名请求头出现多次，但命令幂等键和操作人必须唯一。
 * 遇到数组时返回 undefined，后续 DTO 校验会以 400 拒绝这个歧义请求。
 */
function getSingleHeaderValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? undefined : value;
}
