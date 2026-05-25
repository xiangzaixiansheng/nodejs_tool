"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitJob = InitJob;
exports.StartJob = StartJob;
exports.CreateJob = CreateJob;
exports.DeleteJob = DeleteJob;
exports.getJob = getJob;
exports.getJobCount = getJobCount;
const cron_1 = require("cron");
const logger_1 = require("./logger");
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
    const jobFiles = [];
    logger_1.logger.info(`[jobManager] loading jobs: ${jobFiles.length}`);
    if (jobFiles != null) {
        jobFiles.forEach((item) => {
            try {
                const { id, crontab, status, name } = item;
                const cronJob = new cron_1.CronJob(crontab, async () => {
                    logger_1.logger.info(`[jobManager] executing job: ${id}`);
                    await execJob(id, name);
                }, null, true, "Asia/Shanghai");
                const job = { id, crontab, cronJob, status, name };
                jobTable.add(id, job);
                StartJob(id);
            }
            catch (e) {
                logger_1.logger.error(`[jobManager] failed to load job: ${item.id}`, e);
            }
        });
    }
}
function StartJob(id) {
    try {
        const job = jobTable.getValue(id);
        if (job != null) {
            if (!job.status) {
                return '任务已停止';
            }
            const cronJob = job.cronJob;
            if (cronJob != null) {
                logger_1.logger.info(`[jobManager] StartJob id:${job.id}, ${job.crontab}`);
                cronJob.start();
            }
        }
        return "success";
    }
    catch (e) {
        logger_1.logger.error('[jobManager] StartJob failed:', e);
        return '开始任务失败';
    }
}
function CreateJob(param) {
    try {
        const { id, crontab, status, name } = param;
        if (jobTable.containsKey(String(id))) {
            return '任务id重复';
        }
        const cronJob = new cron_1.CronJob(crontab, async () => {
            logger_1.logger.info(`[jobManager] executing job: ${id}`);
            await execJob(id, name);
        }, null, true, "Asia/Shanghai");
        const job = { id, crontab, status, cronJob, name };
        jobTable.add(id, job);
        StartJob(id);
        return 'success';
    }
    catch (e) {
        logger_1.logger.error(`[jobManager] CreateJob failed id:${param.id}`, e);
        return '创建任务失败';
    }
}
function DeleteJob(id) {
    try {
        const job = jobTable.getValue(id);
        if (job != null) {
            const cronJob = job.cronJob;
            if (cronJob != null) {
                cronJob.stop();
            }
        }
        jobTable.remove(id);
        logger_1.logger.info(`[jobManager] deleted job id:${id}`);
        return 'success';
    }
    catch (e) {
        logger_1.logger.error('[jobManager] DeleteJob failed:', e);
        return '删除任务失败';
    }
}
function getJob(id) {
    return jobTable.getValue(id);
}
function getJobCount() {
    return jobTable.getSize();
}
async function execJob(id, name) {
    logger_1.logger.info(`[jobManager] exec id:${id} name:${name}`);
}
//# sourceMappingURL=jobManager.js.map