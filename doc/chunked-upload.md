# 分片上传功能文档

## 架构概览

```
客户端                         服务端
  │                              │
  ├── POST /upload/init ────────►│  创建上传任务，返回 uploadId
  │                              │
  ├── POST /upload/chunk ───────►│  并发上传分片（multer 接收）
  ├── POST /upload/chunk ───────►│  支持暂停/续传
  ├── POST /upload/chunk ───────►│
  │                              │
  ├── POST /upload/merge ───────►│  合并所有分片为完整文件
  │                              │
  ├── GET  /upload/status ──────►│  查询上传进度
  ├── GET  /upload/list ────────►│  获取已上传文件列表
  │                              │
  └── GET  /uploads/files/:name ►│  下载已完成的文件
```

## API 接口

### 1. 初始化上传 — `POST /upload/init`

**请求体：**
```json
{
  "filename": "example.zip",
  "totalSize": 104857600,
  "chunkSize": 2097152
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "uploadId": "uuid-xxx",
    "totalChunks": 50,
    "chunkSize": 2097152
  }
}
```

### 2. 上传分片 — `POST /upload/chunk`

**请求方式：** `multipart/form-data`

| 字段 | 类型 | 说明 |
|------|------|------|
| chunk | File | 分片二进制数据 |
| uploadId | string | 上传任务 ID |
| chunkIndex | string | 分片索引（从 0 开始） |

**响应：**
```json
{
  "success": true,
  "data": {
    "uploadId": "uuid-xxx",
    "chunkIndex": 3,
    "uploadedChunks": 4,
    "totalChunks": 50
  }
}
```

**注意：** 该接口已豁免请求限流，支持高并发上传。

### 3. 合并分片 — `POST /upload/merge`

**请求体：**
```json
{
  "uploadId": "uuid-xxx"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "uploadId": "uuid-xxx",
    "filename": "example.zip",
    "size": 104857600,
    "path": "/uploads/files/uuid-xxx.zip"
  }
}
```

### 4. 查询状态 — `GET /upload/status?uploadId=xxx`

**响应：**
```json
{
  "success": true,
  "data": {
    "uploadId": "uuid-xxx",
    "filename": "example.zip",
    "totalSize": 104857600,
    "totalChunks": 50,
    "uploadedChunks": [0, 1, 2, 3],
    "status": "uploading",
    "progress": 8
  }
}
```

status 取值：`uploading` | `merging` | `done` | `error`

### 5. 文件列表 — `GET /upload/list`

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "uploadId": "uuid-xxx",
      "filename": "example.zip",
      "size": 104857600,
      "status": "done",
      "createdAt": 1716624000000,
      "path": "/uploads/files/uuid-xxx.zip"
    }
  ]
}
```

### 6. 文件下载 — `GET /uploads/files/:filename`

直接返回文件流，带 `Content-Disposition: attachment` 头。

## 服务端实现

### 文件结构

```
src/
├── controllers/upload/upload.ts   # 控制器（init/merge/status/list）
├── index.ts                       # chunk 路由手动注册（需 multer）
└── uploads/                       # 运行时目录（已 gitignore）
    ├── chunks/{uploadId}/{index}  # 临时分片存储
    ├── files/                     # 合并后的完整文件
    └── temp/                      # multer 临时写入目录
```

### 关键设计

| 设计点 | 方案 |
|--------|------|
| 分片存储 | 磁盘文件，按 uploadId 目录隔离 |
| 元数据管理 | 内存 Map（适合单实例部署） |
| chunk 路由 | 手动注册，绑定 multer 中间件 |
| 限流豁免 | index.ts 中间件对 /upload/ 路径跳过 ratelimit |
| 单片大小限制 | multer 配置 100MB |
| 合并策略 | 按索引顺序读取分片，流式写入最终文件 |
| 清理机制 | 合并成功后删除 chunks 目录 |

### 为什么 chunk 路由不用装饰器

Koa 装饰器路由在扫描时统一注册，无法为单个路由插入 multer 中间件。因此 `/upload/chunk` 在 `src/index.ts` 中手动注册：

```typescript
this.router.post('/upload/chunk', chunkUpload.single('chunk'), async (ctx) => {
    const { UploadController } = await import("./controllers/upload/upload");
    const ctrl = new UploadController();
    await ctrl.uploadChunk(ctx);
});
```

## 前端实现

### 页面入口

`public/index.html` — 管理后台，左侧导航包含「分片上传」和「文件管理」两个页面。

### 核心逻辑 — `public/js/upload.js`

| 功能 | 实现 |
|------|------|
| 文件选择 | 拖拽 + 点击，支持任意文件类型 |
| 分片切割 | `File.slice(start, end)` |
| 并发控制 | `concurrentRun()` 函数，可配置并发数（1/3/5/6） |
| 暂停/续传 | `paused` 标志位 + 已上传 Set 过滤 |
| 进度展示 | 实时百分比 + 已完成分片数 + 上传速度 |
| 可配置项 | 分片大小（1/2/5/10 MB）、并发数 |

### 上传流程

```
选择文件 → 点击"开始上传"
  → POST /upload/init（获取 uploadId）
  → 并发 POST /upload/chunk（可暂停/继续）
  → POST /upload/merge（合并完成）
  → 显示"上传完成"
```

## 生产环境建议

1. **元数据持久化** — 当前使用内存 Map，重启后丢失。生产环境建议存入 Redis 或数据库。
2. **分片过期清理** — 添加定时任务清理超时未完成的分片目录。
3. **文件校验** — 合并后计算 MD5/SHA256 与客户端上报值对比，确保完整性。
4. **对象存储** — 大规模部署时将文件存储迁移至 OSS/S3。
5. **多实例部署** — 使用共享存储（NFS/OSS）或将分片直传对象存储。
