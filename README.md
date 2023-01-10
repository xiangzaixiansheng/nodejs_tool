# nodejs_tool

## 一、项目介绍

​	本项目主要使用typescript，记录一些平时常用的代码块和使用方法。项目是使用koa来创建httpserver的。

## 二、项目启动

1、在根目录下yarn一下安装一下包

2、npm run dev 就可以起起来服务



## 三、一些小工具记录

目录生成方法

sudo npm i -g treer

treer -i node_modules  result.txt

├--src  
|  ├─.DS_Store  
|  ├─index.ts  
|  ├─util  
|  |  ├─.DS_Store  
|  |  ├─DateFormat.ts 时间转换  
|  |  ├─arrayTool.ts  数组操作  
|  |  ├─encryption.ts 加密相关  
|  |  ├─execTool.ts 执行linux命令相关  
|  |  ├─limiterReq.ts 请求限制  
|  |  ├─randomTool.ts random相关  
|  |  ├─redisTool.ts 操作redis相关  
|  |  ├─requestRes.ts   
|  |  ├─requestTool.ts 请求相关  
|  |  ├─typeTool.ts 判断类型相关  
|  |  ├─decorator  
|  |  |     └httpMethod.ts  



TODO:

1⃣️增加PM2配置

2⃣️~~增加网页加载~~

3⃣️~~增基于typeorm的mysql连接，数据库操作~~



NODE_ENV=prod node dist/index.js



HTTP-SERVER上传文件

主要是有的时候可能需要起一个httpserver来接收文件

curl -F "file=@文件名" -X POST "http://localhost:8080/api/uploadFile"



## 四、注意

漏洞：

 "request": "^2.88.2",

- 漏洞标题：Express 中的 qs 模块存在原型污染漏洞
- 影响描述：Express 是一个基于 Node.js 的 Web 框架，qs 是一个具备附加安全特性的查询字符串（querystring）解析和序列化库，Express 默认使用 qs 模块进行查询字符串解析。 qs 的受影响版本中由于 parseObject 方法没有对 js 对象的“__proto__”属性进行正确判断，导致攻击者可以通过 qs 解析具有过长数组属性的 js 对象造成拒绝服务。在 4.17.3 之前的 Express 会受到此漏洞的影响，未经身份验证的远程攻击者可以将 payload（如：a[__proto__]=b&a[__proto__]&a[length]=100000000）传入用于访问应用程序的 URL 的查询字符串中，在 qs 解析 URL 时导致 Express 应用程序的 Node 进程被挂起。
- CVE编号：[CVE-2022-24999](https://sctrack.sendcloud.net/track/click2/eNpFT8FKxTAQ_JegtzTdzTbZ5qaIv-BFpKRJ-16wpmLSIoj_buAdhIEZZnZh5lUbpoElSYGWichoC250E1pghomQLUzGMKgSOoSpJRondNylPO9HjnB39fk7-XzBh1L9uqqSsldh_1AhCyk0EY6I1OS11s9yT499n8-ocipVXfazP48t93GpPm3908tzp0HrTg_OOSFBitVvZWnfiKwMKLIKEcS_3zCvVvOI1rtxwcAmDtE1CtEGE2arb1cl1C8f3lVZcgzbfrQKSxXy51fexr79AcswSzk=.html)
- 国家漏洞库信息：
- 影响范围：：[6.5.0, 6.5.3)
- 最小修复版本：6.5.3
- 组件引入路径：yarn.lock -> request@2.88.2 -> qs@6.5.2