import { createRedisConnection } from "./redis";

export default function createConnection() {
  return Promise.all([
    createRedisConnection().then(() => console.log("redis已连接")),
  ]).catch(err => {
    console.error(`redis连接失败: ${err.message}`);
    return Promise.reject(err);
  });
}
