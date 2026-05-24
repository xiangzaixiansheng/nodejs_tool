export declare const getLimiterConfig: (id: any, redis: any) => {
    driver: string;
    db: any;
    duration: number;
    errorMessage: {
        statusCode: number;
        data: {
            code: number;
            msg: string;
        };
    };
    id: any;
    headers: {
        "Retry-After": string;
        reset: string;
        total: string;
    };
    max: number;
    disableHeader: boolean;
    whitelist: (_ctx: any) => void;
    blacklist: (_ctx: any) => void;
};
//# sourceMappingURL=limiterReq.d.ts.map