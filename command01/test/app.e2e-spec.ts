import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';

/**
 * Supertest 将 JSON 响应体声明为 any；此处先收窄为普通对象，避免测试代码绕过类型检查。
 */
function getJsonObject(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new Error('HTTP 响应体不是 JSON 对象');
  }

  return body as Record<string, unknown>;
}

describe('订单命令模式示例（e2e）', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  /** 验证没有副作用的订单读取不需要经过 CommandBus。 */
  it('GET /orders/:orderId 返回种子订单状态', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders/order-created-1001')
      .expect(200);

    expect(response.body).toEqual({
      orderId: 'order-created-1001',
      status: 'CREATED',
      totalAmountInCents: 9900,
    });
  });

  /** 验证重复 HTTP 请求只执行一次取消动作，并返回首次成功结果。 */
  it('POST /orders/:orderId/cancel 通过命令总线执行并幂等返回结果', async () => {
    const commandId = '11111111-1111-4111-8111-111111111111';
    const requestHeaders = {
      'x-command-id': commandId,
      'x-operator-id': 'operator-1001',
    };
    const requestBody = { reason: '客户主动取消' };

    const firstResponse = await request(app.getHttpServer())
      .post('/orders/order-created-1001/cancel')
      .set(requestHeaders)
      .send(requestBody)
      .expect(200);
    const repeatedResponse = await request(app.getHttpServer())
      .post('/orders/order-created-1001/cancel')
      .set(requestHeaders)
      .send(requestBody)
      .expect(200);
    const orderResponse = await request(app.getHttpServer())
      .get('/orders/order-created-1001')
      .expect(200);

    expect(firstResponse.body).toEqual({
      commandId,
      orderId: 'order-created-1001',
      status: 'CANCELLED',
    });
    expect(repeatedResponse.body).toEqual(firstResponse.body);
    expect(getJsonObject(orderResponse.body).status).toBe('CANCELLED');
  });

  /** 验证退款使用独立 Command 与 Handler，并把金额以分传给支付端口。 */
  it('POST /orders/:orderId/refund 处理退款命令', async () => {
    const commandId = '22222222-2222-4222-8222-222222222222';

    const response = await request(app.getHttpServer())
      .post('/orders/order-paid-1001/refund')
      .set('x-command-id', commandId)
      .set('x-operator-id', 'operator-1001')
      .send({ amountInCents: 9900, reason: '部分退款' })
      .expect(200);

    expect(response.body).toEqual({
      commandId,
      orderId: 'order-paid-1001',
      refundId: 'refund-1',
      status: 'REFUNDED',
    });
  });

  /** 验证请求头中的命令元数据会在构造 Command 前被显式校验。 */
  it('rejects missing command metadata before it reaches a command handler', async () => {
    const response = await request(app.getHttpServer())
      .post('/orders/order-created-1001/cancel')
      .set('x-operator-id', 'operator-1001')
      .send({ reason: '客户端未提供幂等键' })
      .expect(400);

    expect(getJsonObject(response.body).message).toEqual(
      expect.arrayContaining(['x-command-id 必须是 UUID v4']),
    );
  });

  /** 验证业务请求体会在构造 Command 前被全局校验管道拒绝。 */
  it('rejects an invalid command payload before it reaches a command handler', async () => {
    const response = await request(app.getHttpServer())
      .post('/orders/order-created-1001/cancel')
      .set('x-command-id', '44444444-4444-4444-8444-444444444444')
      .set('x-operator-id', 'operator-1001')
      .send({ reason: '' })
      .expect(400);

    expect(getJsonObject(response.body).message).toEqual(
      expect.arrayContaining(['reason 不能为空']),
    );
  });

  /** 验证领域状态机错误由统一异常过滤器转换为 422，而非泄露实现细节。 */
  it('maps a domain rule violation to an HTTP 422 response', async () => {
    const response = await request(app.getHttpServer())
      .post('/orders/order-shipped-1001/cancel')
      .set('x-command-id', '33333333-3333-4333-8333-333333333333')
      .set('x-operator-id', 'operator-1001')
      .send({ reason: '发货后尝试取消' })
      .expect(422);

    expect(response.body).toEqual({
      statusCode: 422,
      error: 'DOMAIN_RULE_VIOLATION',
      message: '当前订单状态不允许取消：SHIPPED',
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
