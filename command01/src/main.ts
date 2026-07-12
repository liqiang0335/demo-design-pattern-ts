import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

/** 创建 HTTP 应用并统一注册输入校验与业务异常映射。 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(process.env.PORT ?? 3000);
}

// 顶层异步启动需要显式处理 Promise，避免启动错误被静默忽略。
void bootstrap();
