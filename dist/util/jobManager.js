"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitJob = InitJob;
exports.StartJob = StartJob;
exports.CreateJob = CreateJob;
exports.DeleteJob = DeleteJob;
exports.getJob = getJob;
exports.getJobCount = getJobCount;
const cron_1 = require("cron");
class HashTable {
    size = 0;
    entry = {};
    add(key, value) {
        const keyStr = String(key);
        if (!this.containsKey(keyStr)) {
            this.size++;
        }
        this.entry[keyStr] = value;
    }
    getValue(key) {
        return this.entry[String(key)] ?? null;
    }
    remove(key) {
        const keyStr = String(key);
        if (this.containsKey(keyStr)) {
            delete this.entry[keyStr];
            this.size--;
        }
    }
    containsKey(key) {
        return key in this.entry;
    }
    getSize() {
        return this.size;
    }
}
const jobTable = new HashTable();
async function InitJob() {
    let jobFiles = [];
    console.info(`[jobManager]jobFiles`, jobFiles);
    if (jobFiles != null) {
        jobFiles.forEach((item) => {
            try {
                let { id, crontab, status, name } = item;
                if (item != null) {
                    let cronJob = new cron_1.CronJob(crontab, async () => {
                        console.info('[jobManager]任务执行啦', id);
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
            }
            catch (e) {
                console.error('[jobManager] 加载任务失败', item.id, e);
            }
        });
    }
    ;
}
function StartJob(id) {
    try {
        const job = jobTable.getValue(id);
        if (job != null) {
            if (!job.status) {
                return '任务已停止';
            }
            let cronJob = job.cronJob;
            if (cronJob != null) {
                console.info(`[jobManager]StartJob成功, id:${job.id}, ${job.crontab}`);
                cronJob.start();
            }
        }
        return "success";
    }
    catch (e) {
        console.error('[jobManager]开始任务失败：' + e);
        return '开始任务失败';
    }
}
;
function CreateJob(param) {
    try {
        let { id, crontab, status, name } = param;
        if (jobTable.containsKey(param.id)) {
            return '任务id重复';
        }
        let cronJob = new cron_1.CronJob(crontab, async () => {
            console.info('[jobManager]任务执行啦', id);
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
    }
    catch (e) {
        console.error('[jobManager]创建任务失败：' + "id:" + param.id + e);
        return '创建任务失败';
    }
}
;
function DeleteJob(id) {
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
    }
    catch (e) {
        console.error('[jobManager]删除任务失败：' + e);
        return '删除任务失败';
    }
}
;
function getJob(id) {
    return jobTable.getValue(id);
}
function getJobCount() {
    return jobTable.getSize();
}
async function execJob(id, name) {
    console.info(`任务执行id :${id} name: ${name}`);
}
//# sourceMappingURL=jobManager.js.map