import { redis_tool } from '../util/redisTool';
import { sortBy, arrayChunk } from '../util/arrayTool';
import { httpGet } from '../util/httpClient';
import { logger } from '../util/logger';
import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'fs-extra';
import { Context } from "koa";
import { PaginationInput } from '../schemas';

export class ApiService {
  /**
   * 测试 Redis 读写
   */
  public async testRedis() {
    // 测试 set
    await redis_tool.setString("test", { hello: "hello" });
    // 测试 hset 和加锁
    await redis_tool.hset("testJson", "userName", "haha");
    // 测试 scan 方法
    const res = await redis_tool.scan("*", 100);
    return res;
  }

  /**
   * 测试数组工具
   */
  public async testArray(query?: PaginationInput) {
    if (query?.array) {
      return sortBy(String(query.array).split(","));
    }

    const testArray = [8, 9, 2, 1, 0, 6];
    const result1 = sortBy(testArray);
    const result2 = sortBy(testArray, (item) => -item); // 倒序
    const chunk = arrayChunk(testArray, 3);

    logger.info({ result1, result2, chunk }, 'Array test results');

    return {
      sorted: result1,
      sortedDesc: result2,
      chunked: chunk,
    };
  }

  /**
   * 测试 HTTP 请求
   */
  public async testRequestV1() {
    const res = await httpGet(
      "http://localhost:8080/api/testArray",
      { params: { array: "8,9,2,1,3,4", data: "123" } }
    );
    return res;
  }

  /**
   * 基于文件流上传文件
   */
  public async uploadFileByStream(ctx: Context) {
    // 使用 multer 后的文件格式
    const file = (ctx.request as any).file;
    const files = (ctx.request as any).files;

    if (!file && !files) {
      throw new Error('未找到上传的文件');
    }

    const uploadedFile = file || files?.file;
    if (!uploadedFile) {
      throw new Error('文件上传失败');
    }

    logger.info({
      filename: uploadedFile.originalname,
      size: uploadedFile.size,
    }, 'File uploaded');

    // 移动到目标目录
    const filePath = path.join(__dirname, '../uploads/stream');
    const targetPath = path.join(filePath, uploadedFile.originalname || 'unnamed');

    if (!fs.existsSync(filePath)) {
      await fs.promises.mkdir(filePath, { recursive: true });
    }

    // 复制文件
    await fse.copy(uploadedFile.path, targetPath);
    // 删除临时文件
    await fse.remove(uploadedFile.path);

    return {
      filename: uploadedFile.originalname,
      size: uploadedFile.size,
      path: targetPath,
    };
  }
}
