/**
 * TypeScript 接口在运行时会被擦除，NestJS 无法直接把它们作为注入 Token。
 * 这些 Symbol 只服务于进程内依赖注入；跨进程命令路由仍使用稳定字符串 `type`。
 */
export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
export const INVENTORY_SERVICE = Symbol('INVENTORY_SERVICE');
export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');
export const COMMAND_EXECUTION_REPOSITORY = Symbol(
  'COMMAND_EXECUTION_REPOSITORY',
);
export const COMMAND_EXECUTOR = Symbol('COMMAND_EXECUTOR');
