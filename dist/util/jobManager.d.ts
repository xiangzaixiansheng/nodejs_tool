export declare function InitJob(): Promise<void>;
export declare function StartJob(id: any): "success" | "任务已停止" | "开始任务失败";
export declare function CreateJob(param: any): "success" | "任务id重复" | "创建任务失败";
export declare function DeleteJob(id: number): string;
export declare function getJob(id: number): any;
export declare function getJobCount(): any;
//# sourceMappingURL=jobManager.d.ts.map