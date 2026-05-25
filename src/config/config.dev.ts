export const config = {
    redis: {
        port: 6379,
        host: "127.0.0.1",
        db: 0,
    },
    bullconfig: {
        queue1: "queue1",
        queue2: "queue2",
    },
    mysql: {
        type: "mysql" as const,
        host: "localhost",
        port: 3306,
        username: "root",
        password: process.env.DB_PASSWORD || "",
        database: "sqlstudy",
        synchronize: true,
        logging: true,
        timezone: "+8:00",
        entities: ["src/entities/*"],
    },
};

export default config;
