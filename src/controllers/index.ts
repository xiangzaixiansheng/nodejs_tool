import { Context } from "koa";
import { get } from "../util/decorator/httpMethod";

export class IndexController {
  /**
   * @param ctx
   * @returns
   */
  @get("/")
  public async index(ctx: Context) {
    await ctx.render("index", {
      title: "nodeWeb 首页"
    });
  }
}

export default IndexController;
