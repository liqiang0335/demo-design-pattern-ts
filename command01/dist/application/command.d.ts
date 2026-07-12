export interface Command<TResult> {
    readonly type: string;
    readonly commandId: string;
    readonly operatorId: string;
    readonly resultType?: TResult;
}
