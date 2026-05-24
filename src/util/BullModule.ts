import { Queue, Worker, Job } from 'bullmq';
import getConfig from "../config";

const redisConfig = getConfig().redis;
const { queue1, queue2 } = getConfig().bullconfig;

/**
 * BullMQ 队列管理模块
 * https://docs.bullmq.io/
 */

export class BullModule {
    private queue1Instance!: Queue;
    private queue2Instance!: Queue;
    private worker1!: Worker;
    private worker2!: Worker;

    constructor() {
        this.init();
    }

    public async init() {
        // 初始化队列1
        this.queue1Instance = new Queue(queue1, {
            connection: redisConfig
        });

        // 初始化队列2
        this.queue2Instance = new Queue(queue2, {
            connection: redisConfig
        });

        // 启动 Worker 处理任务
        this.startWorkers();
    }

    private startWorkers() {
        // Worker 1 - 处理队列1（带限流）
        this.worker1 = new Worker(queue1, async (job: Job) => {
            console.log("队列:queue1:任务开始处理", job.id);
            await this.objImpl(job);
        }, {
            connection: redisConfig,
            limiter: {
                max: 1000,
                duration: 5000
            }
        });

        // Worker 2 - 处理队列2
        this.worker2 = new Worker(queue2, async (job: Job) => {
            console.log("队列:queue2:任务开始处理", job.id);
            await this.activeImpl(job);
        }, { connection: redisConfig });

        // 错误处理
        this.worker1.on('failed', (job, err) => {
            console.error(`Worker1 任务失败: ${job?.id}`, err);
        });
        this.worker2.on('failed', (job, err) => {
            console.error(`Worker2 任务失败: ${job?.id}`, err);
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
        console.info("消费任务 queue1:", JSON.stringify(job.data));
    }

    public async activeImpl(job: Job) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.info("消费任务 queue2:", JSON.stringify(job.data));
    }

    public async saveObj(obj: any, objName: string, jobId: number) {
        try {
            const job = await this.queue1Instance.add(
                queue1,
                { [objName]: obj, objName },
                {
                    removeOnComplete: true,
                    jobId: String(jobId)
                }
            );
            console.info(`saveObj success: ${job.id}`);
        } catch (error) {
            console.error("添加到队列中处理错误:", error);
        }
    }

    public async saveActive(userId: string) {
        try {
            const job = await this.queue2Instance.add(
                queue2,
                { userId },
                { removeOnComplete: true }
            );
            console.info(`saveActive success: ${job.id}`);
        } catch (error) {
            console.error("添加到队列中处理错误:", error);
        }
    }

    public async close() {
        await this.worker1?.close();
        await this.worker2?.close();
        await this.queue1Instance?.close();
        await this.queue2Instance?.close();
    }
}

export default new BullModule();
