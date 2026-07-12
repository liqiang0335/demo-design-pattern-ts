import { Controller, Get } from '@nestjs/common';
import { AppService, type ApplicationInfo } from './app.service';

/** 服务根入口，只暴露应用健康说明，不承载订单业务逻辑。 */
@Controller()
export class AppController {
  /** 注入提供应用基础信息的服务。 */
  public constructor(private readonly appService: AppService) { }

  /** 返回可用于确认服务已启动的静态应用信息。 */
  @Get()
  public getApplicationInfo(): ApplicationInfo {
    return this.appService.getApplicationInfo();
  }
}
