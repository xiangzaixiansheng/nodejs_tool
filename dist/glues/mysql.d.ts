import { DataSource } from "typeorm";
declare let AppDataSource: DataSource;
export declare function createMysqlConnection(): Promise<DataSource>;
export declare function getDataSource(): DataSource;
export { AppDataSource };
//# sourceMappingURL=mysql.d.ts.map