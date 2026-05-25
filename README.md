# nodejs_tool

## 一、项目介绍

本项目是一个基于 **Koa2 + TypeScript** 的企业级后端服务框架，集成了现代化的开发工具和最佳实践。

### 技术栈

- **框架**: Koa2 + TypeScript 5.x
- **ORM**: TypeORM 0.3.x (MySQL)
- **缓存**: Redis (ioredis 5.x)
- **队列**: BullMQ
- **校验**: Zod
- **认证**: JWT
- **文档**: Swagger/OpenAPI
- **日志**: log4js
- **测试**: Vitest

## 二、快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 5.7
- Redis >= 5.0

### 安装依赖

```bash
yarn install
```

### 环境配置

复制环境变量文件：

```bash
cp .env.local .env
```

编辑 `.env` 文件配置数据库和 Redis 连接：

```env
NODE_ENV=dev
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=sqlstudy

# Redis 配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0

# JWT 配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 加密密钥
AES_KEY=your_16_char_key
AES_IV=your_16_char_iv
```

### 启动服务

开发模式：

```bash
npm run dev
```

生产模式：

```bash
yarn build
NODE_ENV=prod node dist/index.js
```

## 三、项目结构

```
├── src/
│   ├── config/          # 配置文件
│   │   ├── index.ts     # 环境配置
│   │   ├── keys.ts      # 密钥配置
│   │   └── swagger.ts   # Swagger 配置
│   ├── controllers/     # 控制器
│   │   ├── api/         # API 控制器
│   │   ├── auth/        # 认证控制器
│   │   ├── upload/      # 分片上传控制器
│   │   └── user/        # 用户控制器
│   ├── entities/        # TypeORM 实体
│   ├── glues/           # 数据库/Redis 连接
│   ├── middleware/      # 中间件
│   │   ├── auth.ts      # JWT 认证
│   │   ├── errorHandler.ts
│   │   ├── healthCheck.ts
│   │   ├── requestId.ts
│   │   └── validate.ts  # Zod 校验
│   ├── repositories/    # 数据仓库
│   ├── routes/          # 路由配置
│   ├── schemas/         # Zod 校验 schema
│   ├── service/         # 业务逻辑
│   └── util/            # 工具函数
├── public/              # 静态资源
├── dist/                # 编译输出
└── doc/                 # 文档
    ├── chunked-upload.md    # 分片上传文档
    ├── redis-lock-guide.md  # Redis 锁使用指南
    └── exec-tool-guide.md   # 命令执行工具指南
```

## 四、API 接口

### Swagger 文档

启动服务后访问：

```
http://localhost:3000/api-docs
```

### 主要接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/` | 首页 |
| GET | `/health` | 健康检查 |
| GET | `/health/ready` | 就绪检查 |
| POST | `/api/login` | 用户登录 |
| GET | `/api/getUserInfo` | 获取用户信息（需认证）|
| POST | `/api/createUser` | 创建用户 |
| POST | `/api/uploadFile` | 文件上传 |
| POST | `/upload/init` | 分片上传-初始化 |
| POST | `/upload/chunk` | 分片上传-上传分片 |
| POST | `/upload/merge` | 分片上传-合并文件 |
| GET | `/upload/status` | 分片上传-查询进度 |
| GET | `/upload/list` | 分片上传-文件列表 |
| GET | `/uploads/files/:name` | 下载已上传文件 |
| GET | `/api/testRedis` | Redis 测试 |
| GET | `/api/testArray` | 数组工具测试 |

### 文件上传示例

```bash
curl -F "file=@文件名" -X POST "http://localhost:3000/api/uploadFile"
```

## 五、功能特性

### 1. JWT 认证

登录获取 token：

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "123456"}'
```

使用 token 访问受保护接口：

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/getUserInfo
```

### 2. 输入校验

使用 Zod 进行请求参数校验：

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  name: z.string().min(1, '姓名不能为空'),
});
```

### 3. 限流

基于 Redis 的 IP 限流，默认 100 次/分钟。

### 4. 队列任务

使用 BullMQ 处理异步任务：

```typescript
import { bullModule } from './util/BullModule';

await bullModule.saveObj({ key: 'value' }, 'myObj', 1);
await bullModule.saveActive('userId');
```

### 5. 分片上传

企业级大文件分片上传，支持并发上传、暂停续传：

```bash
# 初始化上传
curl -X POST http://localhost:3000/upload/init \
  -H "Content-Type: application/json" \
  -d '{"filename": "large.zip", "totalSize": 104857600, "chunkSize": 2097152}'

# 上传分片
curl -X POST http://localhost:3000/upload/chunk \
  -F "chunk=@chunk_0" -F "uploadId=xxx" -F "chunkIndex=0"

# 合并文件
curl -X POST http://localhost:3000/upload/merge \
  -H "Content-Type: application/json" \
  -d '{"uploadId": "xxx"}'
```

前端管理页面访问 `http://localhost:3000`，支持拖拽上传、进度展示、配置调整。

### 6. 分布式锁

基于 Redis 的企业级分布式锁（`src/util/redisLock.ts`）：

```typescript
import { redisLock } from './util/redisLock';

// 互斥锁
await redisLock.withLock('order:user:123', async () => {
    await createOrder(data);
});

// 幂等保护
const { executed } = await redisLock.idempotent('payment:xxx', async () => {
    await charge(amount);
});

// 信号量（限制并发数）
const permit = await redisLock.acquireSemaphore('api-gateway', 5);
```

支持：互斥锁、可重入锁、读写锁、信号量、自旋锁、幂等保护、定时任务锁、自动续期。

### 7. 日志

使用 log4js 记录日志：

```typescript
import { logger } from './util/logger';

logger.info('操作成功');
logger.error('操作失败:', err);
```

## 六、命令说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式启动（热重载）|
| `yarn build` | 编译 TypeScript |
| `npm test` | 运行测试 |
| `npm run test:coverage` | 运行测试并输出覆盖率 |
| `npm run typecheck` | TypeScript 类型检查 |

## 七、目录生成

生成项目结构树：

```bash
sudo npm i -g treer
treer -i node_modules -o result.txt
```

## 八、升级记录

### 2026-05-25 第二轮优化

- ✅ 企业级分片上传（并发控制、暂停续传、前端管理页面）
- ✅ Redis 分布式锁工具（互斥/可重入/读写/信号量/幂等）
- ✅ execTool 扩展（超时、重试、并发、流式输出、安全执行）
- ✅ 加密模块重写（移除 node-rsa，内置 crypto + AES-256-GCM）
- ✅ 修复命令注入风险（ping.ts exec → execFile）
- ✅ 移除 fs-extra 依赖，统一使用原生 fs
- ✅ 消除 any 类型、过时回调写法
- ✅ 上传接口限流豁免

### 2024-05-24 企业级升级

- ✅ TypeScript 5.x 严格模式
- ✅ TypeORM 0.3.x DataSource API
- ✅ ioredis 5.x + redlock 4.x
- ✅ BullMQ 替代 bull
- ✅ Zod 输入校验
- ✅ JWT 认证
- ✅ Swagger API 文档
- ✅ 优雅关闭机制
- ✅ log4js 日志系统
- ✅ 健康检查端点
- ✅ 限流中间件
- ✅ Vitest 测试框架

## 九、版本符号说明

| 符号 | 用法 | 版本 | 说明 |
|------|------|------|------|
| `^` | ^3.9.2 | 3.*.* | 向后兼容的新功能、特性更新、bug修复 |
| `~` | ~3.9.2 | 3.9.* | 仅 bug 修复补丁 |
