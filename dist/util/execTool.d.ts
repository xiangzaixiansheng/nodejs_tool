import { ChildProcess } from "child_process";
interface ExecOptions {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    timeout?: number;
    maxBuffer?: number;
    shell?: string;
}
interface ExecResult {
    stdout: string;
    stderr: string;
    code: number;
}
interface SpawnStreamOptions {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    shell?: boolean;
    onStdout?: (chunk: string) => void;
    onStderr?: (chunk: string) => void;
}
export declare function execPromise(command: string, options?: ExecOptions): Promise<{
    stdout: string;
    stderr: string;
}>;
export declare function execWithTimeout(command: string, timeoutMs: number, options?: Omit<ExecOptions, "timeout">): Promise<ExecResult>;
export declare function execFileSafe(file: string, args: string[], options?: ExecOptions): Promise<{
    stdout: string;
    stderr: string;
}>;
export declare function spawnWait(command: string, args: readonly string[], options?: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
}): Promise<number>;
export declare function spawnStream(command: string, args: string[], options?: SpawnStreamOptions): {
    child: ChildProcess;
    result: Promise<ExecResult>;
};
export declare function execWithRetry(command: string, retries?: number, delayMs?: number, options?: ExecOptions): Promise<{
    stdout: string;
    stderr: string;
}>;
export declare function execConcurrent(commands: string[], concurrency?: number, options?: ExecOptions): Promise<ExecResult[]>;
export declare function commandExists(cmd: string): Promise<boolean>;
export declare function execOutput(command: string, options?: ExecOptions): Promise<string>;
export {};
//# sourceMappingURL=execTool.d.ts.map