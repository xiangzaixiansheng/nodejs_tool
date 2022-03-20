const v8Profiler = require('v8-profiler-next');
import * as fs from 'fs';
import * as path from "path";
import * as fsExtra from "fs-extra";
//const fs = require('fs');
/***
 * @description 分析Profiler
 * 
 * 在压测下，如果发现请求 QPS 非常低、平均耗时非常长，或者失败率非常高的话，这时就需要将 CPU 信息进行保存，然后用 Chrome 的 JavaScript Profiler 工具来进行分析。

  方法也很简单，用 Chrome 的开发者工具 More-tools → JavaScript Profiler → Load，读取 CPU Profile，查看火焰图

  ab -c 10 -n 100 http://localhost:8080/api/testRedis
  -c10表示并发用户数为10

  -n100表示请求总数为100

 http://localhost:8080/api/testRedis表示请求的目标URL
 */
// 设置采集数据保存的文件名
export class profiler {
    private title: string = 'example';
    private time: number = 30 * 1000;


    public async start() {
        v8Profiler.startProfiling(this.title, true);
        let _p = path.resolve(__dirname, "./cpu_profiler");
        //不存在文件夹则, 创建文件夹
        let isExist = await this.checkFileExist(_p);
        !isExist && fsExtra.ensureDirSync(_p);

        setTimeout(() => { // 30 秒后采集并导出
            const profile = v8Profiler.stopProfiling(this.title);
            profile.export( (error: any, result: any) => { // 将内容写入指定文件
                fs.writeFileSync(`${_p}/${this.title}.cpuprofile`, result);
                profile.delete();
            });

        }, this.time);
    }

    private checkFileExist(filePath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    }

}
