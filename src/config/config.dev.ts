export default {
    redis: {
        port: 6379,
        host: "127.0.0.1",
        db: 0 //可以删除掉哦
    },
    bullconfig: {
        queue1: "queue1",
        queue2: "queue2"
    },
    mysql: {
        type: "mysql",
        host: "localhost",
        port: "3306",
        username: "root",
        password: "xiangzai",
        database: "sqlstudy",
        synchronize: process.env.NODE_ENV === 'dev',//是否进行数据库同步 线上环境必须为false
        logging: process.env.NODE_ENV === 'dev',
        timezone: "+8:00",
        entities:
            process.env.NODE_ENV === "dev" ? ["src/entities/*"] : ["build/entities/*"],
    }
};