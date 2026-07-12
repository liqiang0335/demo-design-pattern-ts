import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { BusinessExceptionFilter } from './interfaces/business-exception.filter';

/**
 * 配置所有 Nest 应用入口共用的 HTTP 边界行为。
 * main.ts 和 e2e 测试都调用此函数，避免测试环境绕过生产环境的校验与异常映射。
 */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validateCustomDecorators: true,
    }),
  );
  app.useGlobalFilters(new BusinessExceptionFilter());
}
