import { Redis } from "ioredis";
interface LockOptions {
    ttlMs?: number;
    retryCount?: number;
    retryDelayMs?: number;
    autoRenew?: boolean;
}
interface LockHandle {
    key: string;
    token: string;
    release: () => Promise<boolean>;
}
interface RWLockHandle {
    key: string;
    token: string;
    mode: "read" | "write";
    release: () => Promise<boolean>;
}
interface SemaphoreHandle {
    key: string;
    token: string;
    release: () => Promise<boolean>;
}
export declare class RedisLock {
    private readonly client;
    private readonly renewTimers;
    constructor(redisClient?: Redis);
    acquire(resource: string, options?: LockOptions): Promise<LockHandle | null>;
    private release;
    acquireReentrant(resource: string, ownerToken: string, options?: Omit<LockOptions, "autoRenew">): Promise<LockHandle | null>;
    private releaseReentrant;
    acquireReadLock(resource: string, options?: Omit<LockOptions, "autoRenew">): Promise<RWLockHandle | null>;
    acquireWriteLock(resource: string, options?: Omit<LockOptions, "autoRenew">): Promise<RWLockHandle | null>;
    acquireSemaphore(resource: string, limit: number, options?: Omit<LockOptions, "autoRenew">): Promise<SemaphoreHandle | null>;
    withLock<T>(resource: string, fn: () => Promise<T>, options?: LockOptions): Promise<T>;
    withReadLock<T>(resource: string, fn: () => Promise<T>, options?: Omit<LockOptions, "autoRenew">): Promise<T>;
    withWriteLock<T>(resource: string, fn: () => Promise<T>, options?: Omit<LockOptions, "autoRenew">): Promise<T>;
    idempotent<T>(operationId: string, fn: () => Promise<T>, expireMs?: number): Promise<{
        executed: boolean;
        result?: T;
    }>;
    scheduledExec(taskId: string, fn: () => Promise<void>, options?: LockOptions): Promise<boolean>;
    spinLock(resource: string, timeoutMs?: number, options?: Omit<LockOptions, "retryCount" | "retryDelayMs">): Promise<LockHandle | null>;
    private startRenewal;
    private stopRenewal;
    destroy(): void;
}
export declare const redisLock: RedisLock;
export {};
//# sourceMappingURL=redisLock.d.ts.map