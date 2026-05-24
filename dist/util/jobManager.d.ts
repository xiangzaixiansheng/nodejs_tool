import { CronJob } from 'cron';
interface Job {
    id: string | number;
    crontab: string;
    cronJob: CronJob;
    status: boolean;
    name: string;
}
export declare function InitJob(): Promise<void>;
export declare function StartJob(id: any): "success" | "任务已停止" | "开始任务失败";
export declare function CreateJob(param: any): "success" | "任务id重复" | "创建任务失败";
export declare function DeleteJob(id: number): string;
export declare function getJob(id: number): Job | null;
export declare function getJobCount(): number;
export {};
//# sourceMappingURL=jobManager.d.ts.map