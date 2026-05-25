import { CronJob } from 'cron';
import { logger } from './logger';

interface JobEntry {
    id: string | number;
    crontab: string;
    cronJob: CronJob;
    status: boolean;
    name: string;
}

interface JobParam {
    id: string | number;
    crontab: string;
    status: boolean;
    name: string;
}

class HashTable {
    private size = 0;
    private entry: Record<string, JobEntry> = {};

    add(key: string | number, value: JobEntry) {
        const keyStr = String(key);
        if (!this.containsKey(keyStr)) {
            this.size++;
        }
        this.entry[keyStr] = value;
    }

    getValue(key: string | number): JobEntry | null {
        return this.entry[String(key)] ?? null;
    }

    remove(key: string | number) {
        const keyStr = String(key);
        if (this.containsKey(keyStr)) {
            delete this.entry[keyStr];
            this.size--;
        }
    }

    containsKey(key: string): boolean {
        return key in this.entry;
    }

    getSize(): number {
        return this.size;
    }
}

const jobTable = new HashTable();

export async function InitJob() {
    const jobFiles: JobParam[] | null = [];
    logger.info(`[jobManager] loading jobs: ${jobFiles.length}`);
    if (jobFiles != null) {
        jobFiles.forEach((item) => {
            try {
                const { id, crontab, status, name } = item;
                const cronJob = new CronJob(crontab, async () => {
                    logger.info(`[jobManager] executing job: ${id}`);
                    await execJob(id, name);
                }, null, true, "Asia/Shanghai");

                const job: JobEntry = { id, crontab, cronJob, status, name };
                jobTable.add(id, job);
                StartJob(id);
            } catch (e) {
                logger.error(`[jobManager] failed to load job: ${item.id}`, e);
            }
        });
    }
}

export function StartJob(id: string | number): string {
    try {
        const job = jobTable.getValue(id);
        if (job != null) {
            if (!job.status) {
                return '任务已停止';
            }
            const cronJob = job.cronJob;
            if (cronJob != null) {
                logger.info(`[jobManager] StartJob id:${job.id}, ${job.crontab}`);
                cronJob.start();
            }
        }
        return "success";
    } catch (e) {
        logger.error('[jobManager] StartJob failed:', e);
        return '开始任务失败';
    }
}

export function CreateJob(param: JobParam): string {
    try {
        const { id, crontab, status, name } = param;
        if (jobTable.containsKey(String(id))) {
            return '任务id重复';
        }
        const cronJob = new CronJob(crontab, async () => {
            logger.info(`[jobManager] executing job: ${id}`);
            await execJob(id, name);
        }, null, true, "Asia/Shanghai");

        const job: JobEntry = { id, crontab, status, cronJob, name };
        jobTable.add(id, job);
        StartJob(id);
        return 'success';
    } catch (e) {
        logger.error(`[jobManager] CreateJob failed id:${param.id}`, e);
        return '创建任务失败';
    }
}

export function DeleteJob(id: number): string {
    try {
        const job = jobTable.getValue(id);
        if (job != null) {
            const cronJob = job.cronJob;
            if (cronJob != null) {
                cronJob.stop();
            }
        }
        jobTable.remove(id);
        logger.info(`[jobManager] deleted job id:${id}`);
        return 'success';
    } catch (e) {
        logger.error('[jobManager] DeleteJob failed:', e);
        return '删除任务失败';
    }
}

export function getJob(id: number) {
    return jobTable.getValue(id);
}

export function getJobCount() {
    return jobTable.getSize();
}

async function execJob(id: string | number, name: string) {
    logger.info(`[jobManager] exec id:${id} name:${name}`);
}
