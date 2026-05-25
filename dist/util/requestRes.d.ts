export interface SuccessResult<T> {
    statusCode: 200;
    data: T;
}
export interface ErrorResult {
    statusCode: -100;
    msg: string;
}
export type WrapResult<T> = SuccessResult<T> | ErrorResult;
export declare function wrap<T>(task: Promise<T>): Promise<WrapResult<T>>;
//# sourceMappingURL=requestRes.d.ts.map