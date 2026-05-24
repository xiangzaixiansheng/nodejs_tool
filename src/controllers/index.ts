import { Context } from "koa";
import { get } from "../util/decorator/httpMethod";


export default class IndexController {
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
