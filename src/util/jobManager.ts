import { CronJob } from 'cron';

interface Job {
    id: string | number;
    crontab: string;
    cronJob: CronJob;
    status: boolean;
    name: string;
}

interface HashTableEntry {
    [key: string]: Job;
}

class HashTable {
    private size = 0;
    private entry: HashTableEntry = {};

    add(key: string | number, value: Job) {
        const keyStr = String(key);
        if (!this.containsKey(keyStr)) {
            this.size++;
        }
        this.entry[keyStr] = value;
    }

    getValue(key: string | number): Job | null {
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

// 使用单例模式替代 global
const jobTable = new HashTable();

//程序启动时执行
export async function InitJob() {
    //从数据库中获取全部的crontab信息,目前是在内存管理，后期可以通过redis和文件进行管理
    let jobFiles: any[] | null = [];
    console.info(`[jobManager]jobFiles`, jobFiles);
    if (jobFiles != null) {
        jobFiles.forEach((item) => {
            try {
                let { id, crontab, status, name } = item;
                if (item != null) {
                    let cronJob = new CronJob(crontab, async () => {
                        console.info('[jobManager]任务执行啦', id)
                        await execJob(id, name);
                    }, null, true, "Asia/Shanghai");

                    let job = {
                        id,
                        crontab,
                        cronJob,
                        status,
                        name
                    };
                    jobTable.add(id, job);
                    StartJob(id);
                }
            } catch (e) {
                console.error('[jobManager] 加载任务失败', item.id, e);
            }
        });
    };
}

export function StartJob(id: any) {
    try {
        const job = jobTable.getValue(id);
        if (job != null) {
            if (!job.status) {
                return '任务已停止';
            }
            let cronJob = job.cronJob;
            if (cronJob != null) {
                console.info(`[jobManager]StartJob成功, id:${job.id}, ${job.crontab}`)
                cronJob.start();
            }
        }
        return "success";
    } catch (e) {
        console.error('[jobManager]开始任务失败：' + e);
        return '开始任务失败';
    }
};


export function CreateJob(param: any) {
    try {
        let { id, crontab, status, name } = param;
        if (jobTable.containsKey(param.id)) {
            return '任务id重复';
        }
        let cronJob = new CronJob(crontab, async () => {
            console.info('[jobManager]任务执行啦', id)
            await execJob(id, name);
        }, null, true, "Asia/Shanghai");

        let job = {
            id: id,
            crontab: crontab,
            status: status,
            cronJob: cronJob,
            name
        };
        jobTable.add(id, job);
        StartJob(id);
        return 'success';
    } catch (e) {
        console.error('[jobManager]创建任务失败：' + "id:" + param.id + e);
        return '创建任务失败';
    }

};


export function DeleteJob(id: number): string {
    try {
        let job = jobTable.getValue(id);
        if (job != null) {
            let cronJob = job.cronJob;
            if (cronJob != null) {
                cronJob.stop();
            }
        }
        jobTable.remove(id);
        console.info(`[jobManager]已经删除任务 id:${id}`);
        return 'success';
    } catch (e) {
        console.error('[jobManager]删除任务失败：' + e);
        return '删除任务失败';
    }
};


export function getJob(id: number) {
    return jobTable.getValue(id);
}

export function getJobCount() {
    return jobTable.getSize();
}


async function execJob(id: number, name: string) {
    console.info(`任务执行id :${id} name: ${name}`);
}