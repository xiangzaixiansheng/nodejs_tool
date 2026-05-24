import { Context } from "koa";
import fs from 'fs';
import { wrap } from '../../util/requestRes';
import { post, get } from "../../util/decorator/httpMethod";

/**
 * API 测试 Controller 类
 */
export class ApiController {

  
  /**
   * 文件上传 - 简单版
   */
  @post("/uploadFile")
  public async uploadFile(ctx: Context) {
    ctx.body = await wrap(Promise.resolve("success"));
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
