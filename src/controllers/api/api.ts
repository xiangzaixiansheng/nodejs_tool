import { Context } from "koa";
import fs from 'fs';
import { ApiService } from "../../service/ApiService";
import { wrap } from '../../util/requestRes';
import { post, get } from "../../util/decorator/httpMethod";
import { testArraySchema } from "../../schemas";

/**
 * API 测试 Controller 类
 */
export class ApiController {
  private readonly service: ApiService;

  constructor() {
    this.service = new ApiService();
  }

  /**
   * 测试 Redis
   */
  @get("/testRedis")
  public async testRedis(ctx: Context) {
    return ctx.body = await wrap(this.service.testRedis());
  }

  /**
   * 测试数组工具
   */
  @get("/testArray")
  public async testArray(ctx: Context) {
    const validated = testArraySchema.parse(ctx.query);
    return ctx.body = await wrap(this.service.testArray(validated));
  }

  /**
   * 测试 HTTP 请求
   */
  @post("/testRequestV1")
  public async testRequestV1(ctx: Context) {
    return ctx.body = await wrap(this.service.testRequestV1());
  }

  /**
   * 文件上传 - 简单版
   */
  @post("/uploadFile")
  public async uploadFile(ctx: Context) {
    ctx.body = await wrap(Promise.resolve("success"));
  }

  /**
   * 文件上传 - 流式处理
   */
  @post("/uploadFile2")
  public async uploadFileByStream(ctx: Context) {
    return ctx.body = await wrap(this.service.uploadFileByStream(ctx));
  }

  /**
   * 文件下载
   */
  @get('/download')
  public async download(ctx: Context) {
    const filename = "readMe.txt";
    ctx.set('Content-Type', 'application/vnd.openxmlformats');
    ctx.set('Content-Disposition', 'attachment; filename=' + filename);
    const filePath = __dirname + `/../../download/${filename}`;

    if (!fs.existsSync(filePath)) {
      ctx.status = 404;
      ctx.body = { success: false, error: '文件不存在' };
      return;
    }

    ctx.body = fs.createReadStream(filePath);
  }
}

export default ApiController;
