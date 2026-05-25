import { createMysqlConnection } from "./mysql";
import { createRedisConnection } from "./redis";
import { logger } from "../util/logger";

export default function createConnection() {
  return Promise.all([
    createRedisConnection().then(() => logger.info("Redis connected")),
    createMysqlConnection().then(() => logger.info("MySQL connected"))
  ]).catch(err => {
    logger.error(`Connection failed: ${err.message}`);
    return Promise.reject(err);
  });
}
