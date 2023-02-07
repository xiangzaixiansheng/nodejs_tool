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

启动线上环境命令：

NODE_ENV=prod node dist/index.js



HTTP-SERVER上传文件

主要是有的时候可能需要起一个httpserver来接收文件

curl -F "file=@文件名" -X POST "http://localhost:3000/api/uploadFile"



## 四、知识点

package.json中的脱字符(^)

| 符号 | 用法   | 版本  | 说明                                                         |
| ---- | ------ | ----- | ------------------------------------------------------------ |
| (^)  | ^3.9.2 | 3.*.* | 1. 向后兼容的新功能 2. 废弃特性，但是暂时保留 3. 特性更新/新增 4. bug修复补丁 |
| (~)  | ~3.9.2 | 3.9.* | 1. bug修复补丁                                               |