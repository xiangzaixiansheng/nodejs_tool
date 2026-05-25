import { exec, spawn, execFile, ChildProcess } from "child_process";
import { promisify } from "util";

const execify = promisify(exec);
const execFileify = promisify(execFile);

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

/**
 * 执行命令，返回 stdout/stderr
 */
export async function execPromise(
    command: string,
    options?: ExecOptions
): Promise<{ stdout: string; stderr: string }> {
    return execify(command, {
        maxBuffer: 8000 * 1024,
        ...options,
    });
}

/**
 * 执行命令，带超时控制
 */
export async function execWithTimeout(
    command: string,
    timeoutMs: number,
    options?: Omit<ExecOptions, "timeout">
): Promise<ExecResult> {
    return new Promise((resolve, reject) => {
        const child = exec(
            command,
            { maxBuffer: 8000 * 1024, timeout: timeoutMs, ...options },
            (error: any, stdout: string, stderr: string) => {
                if (error && error.killed) {
                    reject(new Error(`Command timed out after ${timeoutMs}ms: ${command}`));
                    return;
                }
                resolve({
                    stdout: stdout.toString(),
                    stderr: stderr.toString(),
                    code: error ? error.code ?? 1 : 0,
                });
            }
        );
        child.unref?.();
    });
}

/**
 * 安全执行文件（避免 shell 注入），适合执行二进制文件
 */
export async function execFileSafe(
    file: string,
    args: string[],
    options?: ExecOptions
): Promise<{ stdout: string; stderr: string }> {
    return execFileify(file, args, {
        maxBuffer: 8000 * 1024,
        ...options,
    });
}

/**
 * spawn 方式执行，等待结束返回退出码
 */
export async function spawnWait(
    command: string,
    args: readonly string[],
    options?: { cwd?: string; env?: NodeJS.ProcessEnv }
): Promise<number> {
    return new Promise((resolve) => {
        const proc = spawn(command, args, { stdio: "inherit", ...options });
        proc.on("close", (code) => resolve(code || 0));
    });
}

/**
 * spawn 方式执行，实时获取输出流（适合长时间运行的命令）
 */
export function spawnStream(
    command: string,
    args: string[],
    options?: SpawnStreamOptions
): { child: ChildProcess; result: Promise<ExecResult> } {
    const { onStdout, onStderr, ...spawnOpts } = options || {};

    const child = spawn(command, args, {
        ...spawnOpts,
        stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data: Buffer) => {
        const str = data.toString();
        stdout += str;
        onStdout?.(str);
    });

    child.stderr?.on("data", (data: Buffer) => {
        const str = data.toString();
        stderr += str;
        onStderr?.(str);
    });

    const result = new Promise<ExecResult>((resolve, reject) => {
        child.on("close", (code) => {
            resolve({ stdout, stderr, code: code || 0 });
        });
        child.on("error", reject);
    });

    return { child, result };
}

/**
 * 执行命令，失败时自动重试
 */
export async function execWithRetry(
    command: string,
    retries: number = 3,
    delayMs: number = 1000,
    options?: ExecOptions
): Promise<{ stdout: string; stderr: string }> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await execPromise(command, options);
        } catch (err) {
            lastError = err as Error;
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
            }
        }
    }

    throw lastError;
}

/**
 * 并发执行多个命令，返回所有结果
 */
export async function execConcurrent(
    commands: string[],
    concurrency: number = 5,
    options?: ExecOptions
): Promise<ExecResult[]> {
    const results: ExecResult[] = [];
    const executing = new Set<Promise<void>>();

    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i]!;
        const task = (async (index: number, command: string) => {
            try {
                const { stdout, stderr } = await execPromise(command, options);
                results[index] = { stdout, stderr, code: 0 };
            } catch (err: any) {
                results[index] = {
                    stdout: err.stdout || "",
                    stderr: err.stderr || err.message,
                    code: err.code ?? 1,
                };
            }
        })(i, cmd).then(() => { executing.delete(task); });

        executing.add(task);
        if (executing.size >= concurrency) {
            await Promise.race(executing);
        }
    }

    await Promise.all(executing);
    return results;
}

/**
 * 检查命令是否存在（which/where）
 */
export async function commandExists(cmd: string): Promise<boolean> {
    try {
        const check = process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`;
        await execPromise(check);
        return true;
    } catch {
        return false;
    }
}

/**
 * 执行命令并只返回 stdout（去除尾部换行）
 */
export async function execOutput(command: string, options?: ExecOptions): Promise<string> {
    const { stdout } = await execPromise(command, options);
    return stdout.trimEnd();
}
