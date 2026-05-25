# execTool 命令执行工具使用指南

## 方法一览

| 方法 | 底层 | 适用场景 |
|------|------|----------|
| `execPromise` | exec | 简单命令，结果一次性返回 |
| `execWithTimeout` | exec | 需要超时保护的命令 |
| `execFileSafe` | execFile | 执行二进制文件，防 shell 注入 |
| `execOutput` | exec | 只关心 stdout 的快捷调用 |
| `execWithRetry` | exec | 网络请求等可能失败需重试的命令 |
| `execConcurrent` | exec | 批量并发执行多个命令 |
| `spawnWait` | spawn | 长时间运行，继承终端输出 |
| `spawnStream` | spawn | 长时间运行，需要实时处理输出 |
| `commandExists` | exec | 检查系统是否安装了某个命令 |

---

## exec vs spawn 核心区别

```
exec:  命令执行完毕 → 一次性返回全部 stdout/stderr（存在 buffer 中）
spawn: 命令执行过程中 → 通过 stream 实时返回数据
```

| 对比项 | exec | spawn |
|--------|------|-------|
| 输出方式 | 缓冲，结束后一次返回 | 流式，实时返回 |
| 内存占用 | 受 maxBuffer 限制（默认 8MB） | 无缓冲限制 |
| 命令写法 | 整条字符串 `"ls -la /tmp"` | 拆分 `"ls", ["-la", "/tmp"]` |
| Shell 解析 | 默认通过 shell 执行（支持管道、通配符） | 默认直接执行（更安全） |
| 适合场景 | 短命令、需要完整结果 | 长时间命令、大量输出、实时处理 |

---

## 各方法详细说明与示例

### 1. execPromise — 基础命令执行

最常用的方法，适合执行结果可预期的短命令。

```typescript
import { execPromise } from "./util/execTool";

// 获取 git 分支
const { stdout } = await execPromise("git branch --show-current");
console.log("当前分支:", stdout.trim());

// 指定工作目录
const { stdout: files } = await execPromise("ls -la", { cwd: "/tmp" });

// 指定环境变量
await execPromise("npm run build", {
    env: { ...process.env, NODE_ENV: "production" }
});
```

**适合：** `git` 命令、`ls`、`cat`、`grep`、简单的 `npm` 命令等。

**不适合：** 输出特别大的命令（超过 maxBuffer 会报错）、需要实时看到输出的场景。

---

### 2. execWithTimeout — 带超时的执行

防止命令卡死导致进程挂起。

```typescript
import { execWithTimeout } from "./util/execTool";

// 5 秒超时
const result = await execWithTimeout("curl https://api.example.com/health", 5000);

if (result.code === 0) {
    console.log("服务正常:", result.stdout);
} else {
    console.log("服务异常:", result.stderr);
}

// 超时会抛出异常
try {
    await execWithTimeout("sleep 30", 3000);
} catch (err) {
    // "Command timed out after 3000ms: sleep 30"
}
```

**适合：** 网络请求（curl/wget）、可能卡死的外部程序、CI/CD 脚本中需要保证不阻塞的场景。

---

### 3. execFileSafe — 安全执行（防注入）

不经过 shell 解析，直接执行二进制文件。用户输入不会被当作 shell 命令。

```typescript
import { execFileSafe } from "./util/execTool";

// 安全：即使 filename 包含 `; rm -rf /` 也不会被执行
const userFilename = req.body.filename; // 可能是恶意输入
const { stdout } = await execFileSafe("file", ["--mime-type", userFilename]);

// 对比 execPromise 的危险写法：
// await execPromise(`file --mime-type ${userFilename}`);
// 如果 userFilename = "a.txt; rm -rf /" 就完蛋了
```

**适合：** 任何参数来自用户输入的场景、调用系统工具（ffmpeg、imagemagick 等）。

**限制：** 不支持管道 `|`、重定向 `>`、通配符 `*`，因为这些是 shell 特性。

---

### 4. execOutput — 快捷获取输出

只关心 stdout 内容时的语法糖，自动去除尾部换行。

```typescript
import { execOutput } from "./util/execTool";

const nodeVersion = await execOutput("node --version");
// "v20.11.0"（不带换行符）

const currentDir = await execOutput("pwd");
const gitHash = await execOutput("git rev-parse --short HEAD");
```

**适合：** 获取版本号、路径、hash 等单行结果。

---

### 5. execWithRetry — 自动重试

网络不稳定或外部服务偶尔不可用时使用。

```typescript
import { execWithRetry } from "./util/execTool";

// 最多重试 3 次，间隔递增（1s, 2s, 3s）
const { stdout } = await execWithRetry(
    "curl -s https://api.example.com/data",
    3,      // 重试次数
    1000    // 基础延迟（ms），实际延迟 = delayMs * attempt
);

// 拉取 docker 镜像（网络问题常见）
await execWithRetry("docker pull nginx:latest", 5, 2000);
```

**适合：** `curl`、`docker pull`、`npm install`、任何依赖网络的命令。

---

### 6. execConcurrent — 批量并发

同时执行多个独立命令，控制并发数避免系统过载。

```typescript
import { execConcurrent } from "./util/execTool";

// 并发检查多个服务状态（最多 5 个同时执行）
const commands = [
    "curl -s -o /dev/null -w '%{http_code}' http://service-a/health",
    "curl -s -o /dev/null -w '%{http_code}' http://service-b/health",
    "curl -s -o /dev/null -w '%{http_code}' http://service-c/health",
];

const results = await execConcurrent(commands, 5);
results.forEach((r, i) => {
    console.log(`Service ${i}: ${r.code === 0 ? r.stdout : "DOWN"}`);
});

// 批量压缩图片
const images = ["a.png", "b.png", "c.png"];
const compressCommands = images.map(img => `pngquant --quality=65-80 ${img}`);
await execConcurrent(compressCommands, 3);
```

**适合：** 批量操作、健康检查、并行构建任务。

---

### 7. spawnWait — 继承终端输出

命令的 stdout/stderr 直接打印到当前终端，适合用户可见的交互式命令。

```typescript
import { spawnWait } from "./util/execTool";

// 运行测试，输出实时显示在终端
const code = await spawnWait("npm", ["test"]);
if (code !== 0) {
    console.log("测试失败");
    process.exit(1);
}

// 安装依赖（用户能看到实时进度）
await spawnWait("npm", ["install"]);

// 指定工作目录
await spawnWait("make", ["build"], { cwd: "/path/to/project" });
```

**适合：** CLI 工具、构建脚本、需要用户看到实时输出的场景。

**不适合：** 需要在代码中处理输出内容的场景（因为输出直接到终端，代码拿不到）。

---

### 8. spawnStream — 实时处理输出流

既能实时获取输出，又能在代码中处理每一行内容。

```typescript
import { spawnStream } from "./util/execTool";

// 监控日志文件
const { child, result } = spawnStream("tail", ["-f", "/var/log/app.log"], {
    onStdout: (chunk) => {
        if (chunk.includes("ERROR")) {
            sendAlert(chunk); // 发现错误就报警
        }
    }
});

// 5 秒后停止监控
setTimeout(() => child.kill(), 5000);
const { stdout } = await result;

// 执行构建并实时显示 + 记录日志
const { result: buildResult } = spawnStream("npm", ["run", "build"], {
    cwd: "/path/to/project",
    onStdout: (chunk) => process.stdout.write(chunk),
    onStderr: (chunk) => process.stderr.write(chunk),
});

const { code, stdout: buildLog } = await buildResult;
fs.writeFileSync("build.log", buildLog);
```

**适合：** 日志监控、构建过程记录、需要实时处理 + 最终汇总的场景。

---

### 9. commandExists — 检查命令是否安装

```typescript
import { commandExists } from "./util/execTool";

if (await commandExists("ffmpeg")) {
    await execPromise("ffmpeg -i input.mp4 output.mp3");
} else {
    throw new Error("请先安装 ffmpeg: brew install ffmpeg");
}

if (!(await commandExists("docker"))) {
    console.log("Docker 未安装，跳过容器化部署");
}
```

---

## 选择指南

```
需要执行命令并获取结果？
├── 结果很短（一行/几行）→ execOutput
├── 需要超时保护 → execWithTimeout
├── 参数来自用户输入 → execFileSafe
├── 可能失败需重试 → execWithRetry
├── 多个命令并发 → execConcurrent
└── 普通场景 → execPromise

需要实时输出？
├── 直接显示在终端给用户看 → spawnWait
└── 代码中处理每行输出 → spawnStream

只是检查命令是否可用？
└── commandExists
```

## 安全注意事项

1. **永远不要拼接用户输入到 exec 命令中** — 用 `execFileSafe` 代替
2. **网络相关命令加超时** — 避免进程永久挂起
3. **大输出用 spawn** — exec 的 buffer 有上限（默认 8MB）
4. **敏感命令不要打日志** — 包含密码/token 的命令输出不要记录
