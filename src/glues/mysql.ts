import { createConnection } from "typeorm";
import getConfig from "../config";
//import { entrys } from '../entities'


export function createMysqlConnection() {
  const config = getConfig();
  //config.mysql.entities = entrys || [];
  return createConnection(config.mysql);
}
