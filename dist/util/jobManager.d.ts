import { CronJob } from 'cron';
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
export declare function InitJob(): Promise<void>;
export declare function StartJob(id: string | number): string;
export declare function CreateJob(param: JobParam): string;
export declare function DeleteJob(id: number): string;
export declare function getJob(id: number): JobEntry | null;
export declare function getJobCount(): number;
export {};
//# sourceMappingURL=jobManager.d.ts.map