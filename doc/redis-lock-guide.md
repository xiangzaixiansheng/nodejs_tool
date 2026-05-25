# Redis 分布式锁使用指南

## 功能总览

| 锁类型 | 方法 | 企业场景 |
|--------|------|----------|
| 互斥锁 | `acquire` / `withLock` | 防重复下单、定时任务抢占 |
| 可重入锁 | `acquireReentrant` | 递归调用、嵌套业务方法 |
| 读写锁 | `acquireReadLock` / `acquireWriteLock` | 缓存更新、配置热加载 |
| 信号量 | `acquireSemaphore` | 限制三方 API 并发数 |
| 自旋锁 | `spinLock` | 库存扣减、热点数据竞争 |
| 幂等保护 | `idempotent` | 防重复支付、接口幂等 |
| 定时任务锁 | `scheduledExec` | 订单超时取消、延迟通知 |

---

## 快速开始

```typescript
import { redisLock } from "../util/redisLock";
```

---

## 1. 互斥锁（最常用）

### 场景：防止重复下单

```typescript
const lock = await redisLock.acquire("order:user:12345", {
    ttlMs: 5000,       // 锁持有时间 5 秒
    retryCount: 3,     // 重试 3 次
    retryDelayMs: 200, // 每次重试间隔 200ms
});

if (!lock) {
    ctx.body = { success: false, error: "请勿重复提交" };
    return;
}

try {
    await createOrder(orderData);
} finally {
    await lock.release();
}
```

### 场景：用 withLock 简化（推荐）

```typescript
const order = await redisLock.withLock(
    "order:user:12345",
    async () => {
        return await createOrder(orderData);
    },
    { ttlMs: 5000 }
);
```

`withLock` 会自动获取和释放锁，异常时也能保证释放。

### 场景：长时间任务 + 自动续期

```typescript
const lock = await redisLock.acquire("report:generate:daily", {
    ttlMs: 30000,
    autoRenew: true,  // 看门狗自动续期，防止任务未完成锁就过期
});

try {
    await generateDailyReport(); // 可能耗时超过 30 秒
} finally {
    await lock.release(); // 释放时自动停止续期
}
```

**autoRenew 原理：** 每隔 ttl/3 时间自动延长锁的过期时间，直到主动释放。解决了"业务执行时间无法精确预估"的问题。

---

## 2. 可重入锁

### 场景：嵌套业务方法共享锁

```typescript
const ownerToken = "request-abc-123"; // 同一请求链路用同一 token

async function updateInventory(productId: string) {
    const lock = await redisLock.acquireReentrant(
        `inventory:${productId}`,
        ownerToken,
        { ttlMs: 10000 }
    );
    if (!lock) throw new Error("获取锁失败");

    try {
        await deductStock(productId);    // 内部也可能加锁
        await updateCache(productId);     // 内部也可能加锁
    } finally {
        await lock.release(); // 计数减 1，归零时真正释放
    }
}

async function deductStock(productId: string) {
    // 同一 ownerToken 可以再次获取，计数 +1
    const lock = await redisLock.acquireReentrant(
        `inventory:${productId}`,
        ownerToken,
        { ttlMs: 10000 }
    );
    if (!lock) throw new Error("获取锁失败");

    try {
        // 扣减库存逻辑
    } finally {
        await lock.release(); // 计数减 1
    }
}
```

---

## 3. 读写锁

### 场景：缓存更新时阻塞读取

```typescript
// 读操作 — 多个读者可同时持有
async function getConfig(key: string) {
    return redisLock.withReadLock(`config:${key}`, async () => {
        return await loadConfigFromDB(key);
    });
}

// 写操作 — 独占，等待所有读者释放
async function updateConfig(key: string, value: any) {
    return redisLock.withWriteLock(`config:${key}`, async () => {
        await saveConfigToDB(key, value);
        await invalidateCache(key);
    }, { ttlMs: 15000 });
}
```

**特性：**
- 多个 `readLock` 可以同时持有（读不互斥）
- `writeLock` 需要等待所有读锁释放后才能获取
- `writeLock` 持有期间，新的读锁和写锁都会被阻塞

---

## 4. 信号量

### 场景：限制第三方 API 并发调用

```typescript
// 最多同时 5 个请求访问支付网关
async function callPaymentGateway(orderId: string) {
    const permit = await redisLock.acquireSemaphore(
        "payment-gateway",
        5,  // 最大并发数
        { ttlMs: 30000, retryCount: 10, retryDelayMs: 500 }
    );

    if (!permit) {
        throw new Error("支付网关繁忙，请稍后重试");
    }

    try {
        return await paymentApi.charge(orderId);
    } finally {
        await permit.release();
    }
}
```

### 场景：数据库批量写入限流

```typescript
async function batchInsert(records: any[]) {
    for (const record of records) {
        const permit = await redisLock.acquireSemaphore("db-writer", 10, {
            ttlMs: 5000,
            retryCount: 20,
            retryDelayMs: 100,
        });

        if (permit) {
            insertRecord(record).finally(() => permit.release());
        }
    }
}
```

---

## 5. 自旋锁

### 场景：库存扣减（高竞争热点）

```typescript
async function deductStock(productId: string, quantity: number) {
    // 持续尝试直到获取锁或超时（5 秒）
    const lock = await redisLock.spinLock(
        `stock:${productId}`,
        5000,  // 最大等待时间
        { ttlMs: 3000 }
    );

    if (!lock) {
        throw new Error("系统繁忙，请稍后重试");
    }

    try {
        const stock = await getStock(productId);
        if (stock < quantity) {
            throw new Error("库存不足");
        }
        await setStock(productId, stock - quantity);
    } finally {
        await lock.release();
    }
}
```

**与普通互斥锁的区别：** 自旋锁会以更高频率（~50ms）持续尝试获取锁，适合锁持有时间极短但竞争激烈的场景。

---

## 6. 幂等性保护

### 场景：防止重复支付

```typescript
async function processPayment(paymentId: string, amount: number) {
    const { executed, result } = await redisLock.idempotent(
        `payment:${paymentId}`,
        async () => {
            return await chargeUser(paymentId, amount);
        },
        86400000  // 幂等 key 保留 24 小时
    );

    if (!executed) {
        // 已经执行过了，直接返回
        ctx.body = { success: true, message: "订单已处理" };
        return;
    }

    ctx.body = { success: true, data: result };
}
```

**原理：** 基于 operationId 去重 + 分布式锁双重检查，保证同一操作全局只执行一次。

### 场景：Webhook 回调去重

```typescript
router.post("/webhook/payment", async (ctx) => {
    const callbackId = ctx.request.body.event_id;

    const { executed } = await redisLock.idempotent(
        `webhook:${callbackId}`,
        async () => {
            await handlePaymentCallback(ctx.request.body);
        },
        7200000 // 2 小时内不重复处理
    );

    // 不管是否执行都返回 200，避免平台重试
    ctx.status = 200;
    ctx.body = { received: true, processed: executed };
});
```

---

## 7. 定时任务锁

### 场景：订单超时自动取消（多实例部署）

```typescript
// 多个实例同时运行，只有一个会实际执行
async function checkExpiredOrders() {
    const orders = await getExpiredOrders();

    for (const order of orders) {
        const executed = await redisLock.scheduledExec(
            `cancel-order:${order.id}`,
            async () => {
                await cancelOrder(order.id);
                await refundUser(order.userId, order.amount);
                await sendNotification(order.userId, "订单已取消");
            }
        );

        if (executed) {
            logger.info(`Order ${order.id} cancelled`);
        }
        // executed === false 说明其他实例已经处理了
    }
}
```

---

## 配置参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `ttlMs` | 10000 | 锁过期时间（毫秒），防止死锁 |
| `retryCount` | 3 | 获取锁失败时的重试次数 |
| `retryDelayMs` | 200 | 重试间隔（毫秒），实际会加随机抖动 |
| `autoRenew` | false | 是否启用看门狗自动续期 |

---

## 最佳实践

### 1. TTL 设置原则

```
ttlMs = 预估业务执行时间 × 3
```

太短：业务未完成锁就过期，导致并发问题
太长：持有者崩溃后，其他人要等很久才能获取

不确定时用 `autoRenew: true`。

### 2. 锁粒度

```typescript
// 太粗 — 所有用户共用一把锁，性能瓶颈
await redisLock.acquire("order");

// 合适 — 按用户隔离
await redisLock.acquire(`order:user:${userId}`);

// 更细 — 按商品隔离（适合库存场景）
await redisLock.acquire(`stock:product:${productId}`);
```

### 3. 必须用 try/finally

```typescript
const lock = await redisLock.acquire("resource");
if (!lock) return;

try {
    // 业务逻辑
} finally {
    await lock.release(); // 保证释放
}

// 或者直接用 withLock（内部已处理）
await redisLock.withLock("resource", async () => {
    // 业务逻辑
});
```

### 4. 优雅关闭时清理

```typescript
// 在 shutdown 钩子中调用
process.on("SIGTERM", async () => {
    redisLock.destroy(); // 停止所有自动续期定时器
    await redis.quit();
});
```

---

## 选择指南

```
需要防止重复操作？
├── 同一请求重复提交 → acquire / withLock
└── 全局只执行一次 → idempotent

需要并发控制？
├── 只允许一个执行 → acquire
├── 允许 N 个同时执行 → acquireSemaphore
└── 多读少写 → acquireReadLock / acquireWriteLock

高竞争热点资源？
└── spinLock（短时间持续尝试）

递归/嵌套调用？
└── acquireReentrant

多实例定时任务？
└── scheduledExec
```
