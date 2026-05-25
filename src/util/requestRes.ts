export interface SuccessResult<T> {
    statusCode: 200;
    data: T;
}

export interface ErrorResult {
    statusCode: -100;
    msg: string;
}

export type WrapResult<T> = SuccessResult<T> | ErrorResult;

/**
 * 包装 Promise，将异常转换为结果对象（不会 throw）
 */
export async function wrap<T>(task: Promise<T>): Promise<WrapResult<T>> {
    try {
        const data = await task;
        return { statusCode: 200, data };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { statusCode: -100, msg };
    }
}
