"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullModule = exports.BullModule = void 0;
const bullmq_1 = require("bullmq");
const config_1 = require("../config");
const logger_1 = require("./logger");
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
            logger_1.logger.info(`Queue1: processing job ${job.id}`);
            await this.objImpl(job);
        }, {
            connection: redisConfig,
            limiter: {
                max: 1000,
                duration: 5000
            }
        });
        this.worker2 = new bullmq_1.Worker(queue2, async (job) => {
            logger_1.logger.info(`Queue2: processing job ${job.id}`);
            await this.activeImpl(job);
        }, { connection: redisConfig });
        this.worker1.on('failed', (job, err) => {
            logger_1.logger.error(`Worker1 job failed: ${job?.id}`, err);
        });
        this.worker2.on('failed', (job, err) => {
            logger_1.logger.error(`Worker2 job failed: ${job?.id}`, err);
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
        logger_1.logger.info(`Consumed queue1 job: ${JSON.stringify(job.data)}`);
    }
    async activeImpl(job) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        logger_1.logger.info(`Consumed queue2 job: ${JSON.stringify(job.data)}`);
    }
    async saveObj(obj, objName, jobId) {
        try {
            const job = await this.queue1Instance.add(queue1, { [objName]: obj, objName }, {
                removeOnComplete: true,
                jobId: String(jobId)
            });
            logger_1.logger.info(`saveObj success: ${job.id}`);
        }
        catch (error) {
            logger_1.logger.error("Failed to add job to queue1:", error);
        }
    }
    async saveActive(userId) {
        try {
            const job = await this.queue2Instance.add(queue2, { userId }, { removeOnComplete: true });
            logger_1.logger.info(`saveActive success: ${job.id}`);
        }
        catch (error) {
            logger_1.logger.error("Failed to add job to queue2:", error);
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