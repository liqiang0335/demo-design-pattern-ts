import { Injectable } from '@nestjs/common';
import type {
  CommandExecutionRepository,
  CommandExecutionStartResult,
} from '../application/command-execution.repository';

/** 幂等记录在内存中的状态模型。 */
type ExecutionRecord = {
  commandType: string;
  operatorId: string;
  requestFingerprint: string;
  status: 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  result?: unknown;
  errorMessage?: string;
};

/**
 * 命令执行记录的内存实现。
 * 适合本地演示；多实例生产环境必须替换为带 commandId 唯一约束的数据库实现。
 */
@Injectable()
export class InMemoryCommandExecutionRepository implements CommandExecutionRepository {
  /** 使用命令 ID 索引执行状态，模拟数据库中的唯一索引。 */
  private readonly records = new Map<string, ExecutionRecord>();

  /**
   * 在单个 Node.js 进程内原子地获得执行权或读取已有状态。
   * 方法内部没有 await，因此 Map 的读取与写入在一次事件循环执行中不可被其他请求穿插。
   */
  public tryStart(input: {
    commandId: string;
    commandType: string;
    operatorId: string;
    requestFingerprint: string;
  }): Promise<CommandExecutionStartResult> {
    const existingRecord = this.records.get(input.commandId);

    if (!existingRecord) {
      this.records.set(input.commandId, {
        commandType: input.commandType,
        operatorId: input.operatorId,
        requestFingerprint: input.requestFingerprint,
        status: 'PROCESSING',
      });
      return Promise.resolve({ kind: 'STARTED' });
    }

    if (
      existingRecord.commandType !== input.commandType ||
      existingRecord.operatorId !== input.operatorId ||
      existingRecord.requestFingerprint !== input.requestFingerprint
    ) {
      return Promise.resolve({
        kind: 'CONFLICT',
        existingCommandType: existingRecord.commandType,
        existingOperatorId: existingRecord.operatorId,
      });
    }

    if (existingRecord.status === 'SUCCEEDED') {
      return Promise.resolve({
        kind: 'SUCCEEDED',
        result: existingRecord.result,
      });
    }

    if (existingRecord.status === 'PROCESSING') {
      return Promise.resolve({ kind: 'PROCESSING' });
    }

    // 失败记录允许使用相同命令 ID 再试一次；下游 requestId 仍负责屏蔽重复副作用。
    existingRecord.status = 'PROCESSING';
    existingRecord.errorMessage = undefined;
    return Promise.resolve({ kind: 'STARTED' });
  }

  /** 将当前执行记录置为成功，并缓存可直接返回给重复请求的结果。 */
  public markSucceeded(commandId: string, result: unknown): Promise<void> {
    const record = this.records.get(commandId);

    if (!record) {
      return Promise.reject(new Error(`命令执行记录不存在：${commandId}`));
    }

    record.status = 'SUCCEEDED';
    record.result = result;
    return Promise.resolve();
  }

  /** 将当前执行记录置为失败，保留诊断信息供重试和运维查看。 */
  public markFailed(commandId: string, errorMessage: string): Promise<void> {
    const record = this.records.get(commandId);

    if (!record) {
      return Promise.reject(new Error(`命令执行记录不存在：${commandId}`));
    }

    record.status = 'FAILED';
    record.errorMessage = errorMessage;
    return Promise.resolve();
  }
}
