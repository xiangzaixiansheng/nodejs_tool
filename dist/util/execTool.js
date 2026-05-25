"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execPromise = execPromise;
exports.execWithTimeout = execWithTimeout;
exports.execFileSafe = execFileSafe;
exports.spawnWait = spawnWait;
exports.spawnStream = spawnStream;
exports.execWithRetry = execWithRetry;
exports.execConcurrent = execConcurrent;
exports.commandExists = commandExists;
exports.execOutput = execOutput;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execify = (0, util_1.promisify)(child_process_1.exec);
const execFileify = (0, util_1.promisify)(child_process_1.execFile);
async function execPromise(command, options) {
    return execify(command, {
        maxBuffer: 8000 * 1024,
        ...options,
    });
}
async function execWithTimeout(command, timeoutMs, options) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.exec)(command, { maxBuffer: 8000 * 1024, timeout: timeoutMs, ...options }, (error, stdout, stderr) => {
            if (error && error.killed) {
                reject(new Error(`Command timed out after ${timeoutMs}ms: ${command}`));
                return;
            }
            resolve({
                stdout: stdout.toString(),
                stderr: stderr.toString(),
                code: error ? error.code ?? 1 : 0,
            });
        });
        child.unref?.();
    });
}
async function execFileSafe(file, args, options) {
    return execFileify(file, args, {
        maxBuffer: 8000 * 1024,
        ...options,
    });
}
async function spawnWait(command, args, options) {
    return new Promise((resolve) => {
        const proc = (0, child_process_1.spawn)(command, args, { stdio: "inherit", ...options });
        proc.on("close", (code) => resolve(code || 0));
    });
}
function spawnStream(command, args, options) {
    const { onStdout, onStderr, ...spawnOpts } = options || {};
    const child = (0, child_process_1.spawn)(command, args, {
        ...spawnOpts,
        stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (data) => {
        const str = data.toString();
        stdout += str;
        onStdout?.(str);
    });
    child.stderr?.on("data", (data) => {
        const str = data.toString();
        stderr += str;
        onStderr?.(str);
    });
    const result = new Promise((resolve, reject) => {
        child.on("close", (code) => {
            resolve({ stdout, stderr, code: code || 0 });
        });
        child.on("error", reject);
    });
    return { child, result };
}
async function execWithRetry(command, retries = 3, delayMs = 1000, options) {
    let lastError = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await execPromise(command, options);
        }
        catch (err) {
            lastError = err;
            if (attempt < retries) {
                await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
            }
        }
    }
    throw lastError;
}
async function execConcurrent(commands, concurrency = 5, options) {
    const results = [];
    const executing = new Set();
    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        const task = (async (index, command) => {
            try {
                const { stdout, stderr } = await execPromise(command, options);
                results[index] = { stdout, stderr, code: 0 };
            }
            catch (err) {
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
async function commandExists(cmd) {
    try {
        const check = process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`;
        await execPromise(check);
        return true;
    }
    catch {
        return false;
    }
}
async function execOutput(command, options) {
    const { stdout } = await execPromise(command, options);
    return stdout.trimEnd();
}
//# sourceMappingURL=execTool.js.map