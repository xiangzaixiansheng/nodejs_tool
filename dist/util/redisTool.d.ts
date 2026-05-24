import { Redis } from 'ioredis';
import Redlock from 'redlock';
type Lock = {
    unlock: () => Promise<void>;
};
export interface RedisTool {
    setString(key: string, value: any): Promise<string | null>;
    getString(key: string): Promise<any>;
    del(key: string): Promise<number | null>;
}
declare class RedisToolImpl implements RedisTool {
    redis: Redis;
    redlock: Redlock;
    constructor(_redis: Redis);
    lock(resource: string): Promise<Lock | false>;
    unlockLock(lock: any): Promise<void>;
    setString(key: string, value: any): Promise<"OK" | null>;
    set(key: string, value: any): Promise<"OK" | null>;
    getString(key: string): Promise<any>;
    get(key: string): Promise<string | null>;
    mget(keys: string[]): Promise<(string | null)[] | null>;
    keys(pattern: string): Promise<string[] | null>;
    del(key: string): Promise<number | null>;
    sadd(key: string, value: string | string[]): Promise<number | null>;
    smembers(key: string): Promise<string[] | null>;
    sismember(key: string, member: string): Promise<number | null>;
    hset(key: string, field: string, value: any): Promise<number | null>;
    hget(key: string, field: string): Promise<string | null>;
    lpush(key: string, values: string[]): Promise<number | null>;
    hgetall(key: string): Promise<Record<string, string> | null>;
    hmset(key: string, value: Record<string, string>): Promise<"OK" | null>;
    zadd(key: string, score: number, value: string): Promise<number | null>;
    pfadd(key: string, value: string): Promise<number | null>;
    pfcount(key: string): Promise<number | null>;
    pfmerge(key: string, sourcekey: string[]): Promise<"OK" | null>;
    setbit(key: string, offset: number, value: string): Promise<number | null>;
    exists(key: string): Promise<number | null>;
    expire(key: string, expiration: number): Promise<number | null>;
    scan(pattern: string, amountPerScan: number): Promise<string[]>;
    scan2(key: string): Promise<string[]>;
    unlink(key: string): Promise<number>;
    goodDel(pattern: string, time: number): Promise<void>;
}
export declare const redis_tool: RedisToolImpl;
export {};
//# sourceMappingURL=redisTool.d.ts.map