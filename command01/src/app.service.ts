import { Injectable } from '@nestjs/common';

/** 根路径返回的应用说明，方便确认示例服务已经启动。 */
export interface ApplicationInfo {
  readonly name: string;
  readonly description: string;
}

/** 提供不涉及订单业务的应用基础信息。 */
@Injectable()
export class AppService {
  /** 返回示例应用的名称和用途。 */
  public getApplicationInfo(): ApplicationInfo {
    return {
      name: 'NestJS Command Pattern Demo',
      description: '使用稳定命令 Token、Handler 与幂等装饰器处理订单动作',
    };
  }
}
