declare class RedisManager {
    rpush(key: string, data: string): Promise<number>;
    lpop(key: string): Promise<string | null>;
    lock(key: string, value: string, acquireTimeoutSeconds?: number, ttlSeconds?: number): Promise<boolean>;
    unLock(key: string, value: string): Promise<unknown>;
    getRedisLockKey(key: string): string;
}
export declare const redisManager: RedisManager;
export {};
//# sourceMappingURL=redisTool2.d.ts.map