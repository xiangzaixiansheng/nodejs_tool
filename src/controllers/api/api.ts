import { Context } from "koa";
import fs from 'fs';
import { post, get } from "../../util/decorator/httpMethod";

/**
 * API 测试 Controller 类
 */
export class ApiController {

  /**
   * 文件上传 - 简单版
   * 注意：文件处理在 index.ts 中通过 multer 中间件完成
   */
  @post("/uploadFile")
  public async uploadFile(ctx: Context) {
    const file = ctx.file;
    if (!file) {
      ctx.status = 400;
      ctx.body = { success: false, error: '没有上传文件' };
      return;
    }
    ctx.body = {
      success: true,
      data: {
        filename: file.originalname,
        path: `/uploads/${file.filename}`,
        size: file.size,
      },
    };
  }

  /**
   * 文件下载
   */
  @get('/download')
  public async download(ctx: Context) {
    const filename = "WeiboAP-0.6.81-macmini.AppImage";
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