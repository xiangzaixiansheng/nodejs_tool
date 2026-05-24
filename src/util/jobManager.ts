
/***
 * @description 动态在内存中添加定时任务
 */

const CronJob = require('cron').CronJob;

interface HashTableEntry {
    [key: string]: any;
}

class HashTable {
    private size = 0;
    private entry: HashTableEntry = {};

    public add(key: string, value: any) {
        if (!this.containsKey(key)) {
            this.size++;
        }
        this.entry[key] = value;
    }
    public getValue(key: string) {
        return this.containsKey(key) ? this.entry[key] : null;
    }
    public remove(key: string) {
        if (this.containsKey(key) && (delete this.entry[key])) {
            this.size--;
        }
    }
    public containsKey(key: string): boolean {
        return (key in this.entry);
    }

    public containsValue(value: string): boolean {
        for (let prop in this.entry) {
            if (this.entry[prop] == value) {
                return true;
            }
        }
        return false;
    }
    public getValues(): any[] {
        let values: any[] = [];
        for (let prop in this.entry) {
            values.push(this.entry[prop]);
        }
        return values;
    }
    public getKeys(): string[] {
        let keys: string[] = [];
        for (let prop in this.entry) {
            keys.push(prop);
        }
        return keys;
    }
    public getSize(): number {
        return this.size;
    }
    public clear() {
        this.size = 0;
        this.entry = {};
    }
}

global.JobTable = new HashTable();

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
                    global.JobTable.add(id, job);
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
        const job = global.JobTable.getValue(id);
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
        if (global.JobTable.containsKey(param.id)) {
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
        global.JobTable.add(id, job);
        StartJob(id);
        return 'success';
    } catch (e) {
        console.error('[jobManager]创建任务失败：' + "id:" + param.id + e);
        return '创建任务失败';
    }

};


export function DeleteJob(id: number): string {
    try {
        let job = global.JobTable.getValue(id);
        if (job != null) {
            let cronJob = job.cronJob;
            if (cronJob != null) {
                cronJob.stop();
            }
        }
        global.JobTable.remove(id);
        console.info(`[jobManager]已经删除任务 id:${id}`);
        return 'success';
    } catch (e) {
        console.error('[jobManager]删除任务失败：' + e);
        return '删除任务失败';
    }
};


export function getJob(id: number) {
    return global.JobTable.getValue(id);
}

export function getJobCount() {
    return global.JobTable.getSize();
}


async function execJob(id: number, name: string) {
    console.info(`任务执行id :${id} name: ${name}`);
}