export declare const config: {
    port: number;
    redis: {
        port: number;
        host: string;
        db: number;
    };
    bullconfig: {
        queue1: string;
        queue2: string;
    };
    mysql: {
        type: "mysql";
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        synchronize: boolean;
        logging: boolean;
        timezone: string;
        entities: string[];
    };
};
export default config;
//# sourceMappingURL=config.default.d.ts.map