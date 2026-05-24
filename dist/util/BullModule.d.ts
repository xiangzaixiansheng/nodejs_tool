import { Queue, Job } from 'bullmq';
export declare class BullModule {
    private queue1Instance;
    private queue2Instance;
    private worker1;
    private worker2;
    constructor();
    init(): Promise<void>;
    private startWorkers;
    getQueue1(): Queue;
    getQueue2(): Queue;
    objImpl(job: Job): Promise<void>;
    activeImpl(job: Job): Promise<void>;
    saveObj(obj: any, objName: string, jobId: number): Promise<void>;
    saveActive(userId: string): Promise<void>;
    close(): Promise<void>;
}
export declare const bullModule: BullModule;
export default bullModule;
//# sourceMappingURL=BullModule.d.ts.map