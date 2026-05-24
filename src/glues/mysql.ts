import { DataSource } from "typeorm";
import getConfig from "../config";

let AppDataSource: DataSource;

export function createMysqlConnection() {
  const config = getConfig();

  AppDataSource = new DataSource({
    ...config.mysql,
    type: "mysql"
  });

  return AppDataSource.initialize();
}

export function getDataSource(): DataSource {
  if (!AppDataSource || !AppDataSource.isInitialized) {
    throw new Error("Database not initialized. Call createMysqlConnection first.");
  }
  return AppDataSource;
}

export { AppDataSource };
