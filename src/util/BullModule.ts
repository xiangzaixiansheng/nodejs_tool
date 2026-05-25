import { Queue, Worker, Job } from 'bullmq';
import { getConfigSync } from "../config";
import { logger } from './logger';

const redisConfig = getConfigSync().redis;
const { queue1, queue2 } = getConfigSync().bullconfig;

export class BullModule {
    private queue1Instance!: Queue;
    private queue2Instance!: Queue;
    private worker1!: Worker;
    private worker2!: Worker;

    constructor() {
        this.init();
    }

    public async init() {
        this.queue1Instance = new Queue(queue1, {
            connection: redisConfig
        });

        this.queue2Instance = new Queue(queue2, {
            connection: redisConfig
        });

        this.startWorkers();
    }

    private startWorkers() {
        this.worker1 = new Worker(queue1, async (job: Job) => {
            logger.info(`Queue1: processing job ${job.id}`);
            await this.objImpl(job);
        }, {
            connection: redisConfig,
            limiter: {
                max: 1000,
                duration: 5000
            }
        });

        this.worker2 = new Worker(queue2, async (job: Job) => {
            logger.info(`Queue2: processing job ${job.id}`);
            await this.activeImpl(job);
        }, { connection: redisConfig });

        this.worker1.on('failed', (job, err) => {
            logger.error(`Worker1 job failed: ${job?.id}`, err);
        });
        this.worker2.on('failed', (job, err) => {
            logger.error(`Worker2 job failed: ${job?.id}`, err);
        });
    }

    public getQueue1(): Queue {
        return this.queue1Instance;
    }

    public getQueue2(): Queue {
        return this.queue2Instance;
    }

    public async objImpl(job: Job) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        logger.info(`Consumed queue1 job: ${JSON.stringify(job.data)}`);
    }

    public async activeImpl(job: Job) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        logger.info(`Consumed queue2 job: ${JSON.stringify(job.data)}`);
    }

    public async saveObj(obj: unknown, objName: string, jobId: number) {
        try {
            const job = await this.queue1Instance.add(
                queue1,
                { [objName]: obj, objName },
                {
                    removeOnComplete: true,
                    jobId: String(jobId)
                }
            );
            logger.info(`saveObj success: ${job.id}`);
        } catch (error) {
            logger.error("Failed to add job to queue1:", error);
        }
    }

    public async saveActive(userId: string) {
        try {
            const job = await this.queue2Instance.add(
                queue2,
                { userId },
                { removeOnComplete: true }
            );
            logger.info(`saveActive success: ${job.id}`);
        } catch (error) {
            logger.error("Failed to add job to queue2:", error);
        }
    }

    public async close() {
        await this.worker1?.close();
        await this.worker2?.close();
        await this.queue1Instance?.close();
        await this.queue2Instance?.close();
    }
}

export const bullModule = new BullModule();

export default bullModule;
