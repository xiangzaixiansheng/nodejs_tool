# Node.js 原生 fs 模块指南

## 为什么不再需要 fs-extra

Node.js 从 v14 开始逐步补齐了文件系统 API，到 v18+ 已经覆盖了 fs-extra 的绝大多数使用场景。

## 常用 API 对照表

| 场景 | fs-extra | Node.js 原生替代 | 最低版本 |
|------|----------|-----------------|---------|
| 递归创建目录 | `ensureDir` / `mkdirs` | `fs.mkdirSync(dir, { recursive: true })` | v10.12 |
| 递归删除目录 | `remove` | `fs.rmSync(dir, { recursive: true, force: true })` | v14.14 |
| 递归复制 | `copy` | `fs.cpSync(src, dest, { recursive: true })` | v16.7 |
| 检查路径是否存在 | `pathExists` | `fs.existsSync(path)` | 一直存在 |
| 读取 JSON | `readJson` | `JSON.parse(fs.readFileSync(path, 'utf-8'))` | 一直存在 |
| 写入 JSON | `writeJson` | `fs.writeFileSync(path, JSON.stringify(data, null, 2))` | 一直存在 |
| 确保文件存在 | `ensureFile` | 见下方示例 | v10.12 |
| 清空目录 | `emptyDir` | 见下方示例 | v14.14 |

## 实用示例

### 递归创建目录

```typescript
import * as fs from 'fs';

// 同步
fs.mkdirSync('/path/to/deep/dir', { recursive: true });

// 异步
await fs.promises.mkdir('/path/to/deep/dir', { recursive: true });
```

### 递归删除

```typescript
// 同步
fs.rmSync('/path/to/dir', { recursive: true, force: true });

// 异步
await fs.promises.rm('/path/to/dir', { recursive: true, force: true });
```

### 递归复制目录

```typescript
// Node.js 16.7+
fs.cpSync('/src/dir', '/dest/dir', { recursive: true });

// 异步版本
await fs.promises.cp('/src/dir', '/dest/dir', { recursive: true });
```

### 读写 JSON 文件

```typescript
// 读取
function readJson<T>(filePath: string): T {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
}

// 写入
function writeJson(filePath: string, data: unknown): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
```

### 确保文件存在（替代 ensureFile）

```typescript
function ensureFile(filePath: string): void {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
    }
}
```

### 清空目录（替代 emptyDir）

```typescript
function emptyDir(dirPath: string): void {
    fs.rmSync(dirPath, { recursive: true, force: true });
    fs.mkdirSync(dirPath, { recursive: true });
}
```

## fs.promises API

Node.js 提供了 Promise 版本的文件操作，不需要手动 promisify：

```typescript
import { promises as fsp } from 'fs';

await fsp.readFile('/path/to/file', 'utf-8');
await fsp.writeFile('/path/to/file', content);
await fsp.mkdir('/path/to/dir', { recursive: true });
await fsp.rm('/path/to/dir', { recursive: true });
await fsp.stat('/path/to/file');
await fsp.readdir('/path/to/dir');
await fsp.rename('/old/path', '/new/path');
```

## 仍然需要 fs-extra 的场景

- `move()` — 跨文件系统（跨分区）移动文件，原生 `rename` 不支持跨设备
- `outputFile()` — 写入文件时自动创建父目录（原生需两步操作）

如果项目中没有这些需求，完全可以移除 fs-extra 依赖。

## 总结

Node.js 18+ 项目建议直接使用原生 `fs` 模块，减少不必要的依赖，降低 node_modules 体积，并且能获得更好的 TypeScript 类型支持。
