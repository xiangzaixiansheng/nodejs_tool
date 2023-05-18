import { Context } from "koa";
import fs from 'fs';
import { ApiService } from "../../service/ApiService";
import { wrap } from '../../util/requestRes';
import { post, get, put, del } from "../../util/decorator/httpMethod";

/**
 * 
 * api 测试controller类
 * 
 */
export default class AuthController {
  /**
   * 逻辑处理service类
   */
  private readonly service: ApiService;

  constructor() {
    this.service = new ApiService();
  }

  /**
   * test 接口
   * @param ctx 
   * @returns 
   */
  @get("/testRedis")
  public async login(ctx: Context) {
    return ctx.body = await wrap(this.service.testRedis());
  }

  @get("/testArray")
  public async testArray(ctx: Context) {
    let query = ctx.query;
    return ctx.body = await wrap(this.service.testArray(query));
  }

  /**
   * 测试 request-Promise
   * @param ctx 
   * @returns 
   */
  @post("/testRequestV1")
  public async testRequestV1(ctx: Context) {
    return ctx.body = await wrap(this.service.testRequestV1());
  }

  //上传文件
  //curl -F "file=@文件名" -X POST "http://localhost:8080/api/uploadFile"
  @post("/uploadFile")
  public async uploadFile(ctx: Context) {
    ctx.body = await wrap(Promise.resolve("success"));
  }
  //curl -F "file=@文件名" -X POST "http://localhost:3000/api/uploadFile2"
  @post("/uploadFile2")
  public async uploadFileByStream(ctx: Context) {
    ctx.body = await wrap(this.service.uploadFileByStream(ctx));
  }

  @get('/download')
  public async download(ctx: Context) {
    const filename = "readMe.txt"
    ctx.set('Content-Type', 'application/vnd.openxmlformats');
    ctx.set('Content-Disposition', 'attachment; filename=' + filename);
    //ctx.body = fs.readFileSync(__dirname + `/../../download/${filename}`)
    //基于文件流
    ctx.body = fs.createReadStream(__dirname + `/../../download/${filename}`)
  }
}