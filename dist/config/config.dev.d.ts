export declare const config: {
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
//# sourceMappingURL=config.dev.d.ts.map