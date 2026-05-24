declare module 'redlock' {
  import { Redis } from 'ioredis';

  interface Lock {
    unlock(): Promise<void>;
  }

  interface RedlockOptions {
    retryDelay?: number;
    retryCount?: number;
  }

  class Redlock {
    constructor(redis: Redis[], options?: RedlockOptions);
    lock(resource: string, ttl: number): Promise<Lock>;
  }

  export = Redlock;
}
