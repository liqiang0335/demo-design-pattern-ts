import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    /** 验证根路径的应用说明仍可作为最小健康检查使用。 */
    it('should return application information', () => {
      expect(appController.getApplicationInfo()).toEqual({
        name: 'NestJS Command Pattern Demo',
        description: '使用稳定命令 Token、Handler 与幂等装饰器处理订单动作',
      });
    });
  });
});
