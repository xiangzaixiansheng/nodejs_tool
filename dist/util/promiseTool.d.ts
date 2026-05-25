export type PromiseResolver<T> = (val: T) => void;
export type PromiseReject = (reason: unknown) => void;
export type PromiseCallback<T> = (res: PromiseResolver<T>, rej: PromiseReject) => void;
export declare function delay(ms: number): Promise<unknown>;
export declare function promiseWithTimeout<T>(prom: PromiseCallback<T>, timeout: number): Promise<T>;
export declare function retryablePromise<T>(prom: () => Promise<T>, time?: number, duration?: number): Promise<T | undefined>;
export declare function extraPromise<T>(): Promise<{
    promise: Promise<T>;
    reject: PromiseReject;
    resolve: PromiseResolver<T>;
}>;
export declare function concurrentTask<R>(): {
    push: (task: () => Promise<R>) => void;
    run: () => Promise<R[]>;
};
export declare function executeAsyncTask<T>(id: string, task: () => Promise<T>): Promise<T>;
export declare function promiseAllLimit<T, R>(limit: number, array: T[], apiFn: (item: T) => Promise<R>): Promise<R[]>;
//# sourceMappingURL=promiseTool.d.ts.map