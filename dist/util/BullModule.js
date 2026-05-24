"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullModule = exports.BullModule = void 0;
const bullmq_1 = require("bullmq");
const config_1 = require("../config");
const redisConfig = (0, config_1.getConfigSync)().redis;
const { queue1, queue2 } = (0, config_1.getConfigSync)().bullconfig;
class BullModule {
    queue1Instance;
    queue2Instance;
    worker1;
    worker2;
    constructor() {
        this.init();
    }
    async init() {
        this.queue1Instance = new bullmq_1.Queue(queue1, {
            connection: redisConfig
        });
        this.queue2Instance = new bullmq_1.Queue(queue2, {
            connection: redisConfig
        });
        this.startWorkers();
    }
    startWorkers() {
        this.worker1 = new bullmq_1.Worker(queue1, async (job) => {
            console.log("队列:queue1:任务开始处理", job.id);
            await this.objImpl(job);
        }, {
            connection: redisConfig,
            limiter: {
                max: 1000,
                duration: 5000
            }
        });
        this.worker2 = new bullmq_1.Worker(queue2, async (job) => {
            console.log("队列:queue2:任务开始处理", job.id);
            await this.activeImpl(job);
        }, { connection: redisConfig });
        this.worker1.on('failed', (job, err) => {
            console.error(`Worker1 任务失败: ${job?.id}`, err);
        });
        this.worker2.on('failed', (job, err) => {
            console.error(`Worker2 任务失败: ${job?.id}`, err);
        });
    }
    getQueue1() {
        return this.queue1Instance;
    }
    getQueue2() {
        return this.queue2Instance;
    }
    async objImpl(job) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.info("消费任务 queue1:", JSON.stringify(job.data));
    }
    async activeImpl(job) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.info("消费任务 queue2:", JSON.stringify(job.data));
    }
    async saveObj(obj, objName, jobId) {
        try {
            const job = await this.queue1Instance.add(queue1, { [objName]: obj, objName }, {
                removeOnComplete: true,
                jobId: String(jobId)
            });
            console.info(`saveObj success: ${job.id}`);
        }
        catch (error) {
            console.error("添加到队列中处理错误:", error);
        }
    }
    async saveActive(userId) {
        try {
            const job = await this.queue2Instance.add(queue2, { userId }, { removeOnComplete: true });
            console.info(`saveActive success: ${job.id}`);
        }
        catch (error) {
            console.error("添加到队列中处理错误:", error);
        }
    }
    async close() {
        await this.worker1?.close();
        await this.worker2?.close();
        await this.queue1Instance?.close();
        await this.queue2Instance?.close();
    }
}
exports.BullModule = BullModule;
exports.bullModule = new BullModule();
exports.default = exports.bullModule;
//# sourceMappingURL=BullModule.js.map