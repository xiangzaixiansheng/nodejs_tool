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



修改本地remote
git remote set-url origin (新的git地址)



TODO:

1⃣️增加PM2配置

2⃣️增加网页加载

3⃣️增加mysql连接，数据库操作