import { createHash } from 'crypto';
import type { Command } from './command';

/**
 * 为命令生成稳定的请求指纹。
 * 幂等键相同并不代表请求一定相同，因此记录中还必须比对完整命令载荷。
 */
export function createCommandFingerprint<TResult>(command: Command<TResult>): string {
  return createHash('sha256').update(stableSerialize(command)).digest('hex');
}

/**
 * 将由基础数据组成的命令递归序列化为键顺序稳定的字符串。
 * 命令是受控的应用对象，只允许 JSON 风格基础数据，避免不同属性插入顺序产生不同哈希。
 */
function stableSerialize(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string' || typeof value === 'boolean') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('命令载荷不能包含非有限数字');
    }

    return JSON.stringify(value);
  }

  if (typeof value === 'undefined') {
    return 'undefined';
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`);

    return `{${entries.join(',')}}`;
  }

  throw new Error('命令载荷只能包含 JSON 基础数据');
}
