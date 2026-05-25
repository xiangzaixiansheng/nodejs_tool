declare module 'koa-ratelimit' {
    import { Middleware } from 'koa';
    import { Redis } from 'ioredis';

    interface RateLimitOptions {
        driver?: string;
        db?: Redis | Map<string, unknown>;
        duration?: number;
        errorMessage?: unknown;
        id?: ((ctx: any) => string) | ((ctx: any) => unknown);
        headers?: Record<string, string>;
        max?: number;
        disableHeader?: boolean;
        whitelist?: (ctx: any) => boolean | undefined;
        blacklist?: (ctx: any) => boolean | undefined;
    }

    function ratelimit(options: RateLimitOptions): Middleware;
    export default ratelimit;
}

declare module 'koa-static' {
    import { Middleware } from 'koa';

    interface ServeOptions {
        maxage?: number;
        hidden?: boolean;
        index?: string | false;
        defer?: boolean;
        gzip?: boolean;
        br?: boolean;
        setHeaders?: (res: unknown, path: string, stats: unknown) => void;
        extensions?: string[] | false;
    }

    function serve(root: string, opts?: ServeOptions): Middleware;
    export default serve;
}

declare module 'koa-views' {
    import { Middleware } from 'koa';

    interface ViewsOptions {
        autoRender?: boolean;
        extension?: string;
        map?: Record<string, string>;
        engineSource?: Record<string, unknown>;
        options?: Record<string, unknown>;
    }

    function views(root: string, opts?: ViewsOptions): Middleware;
    export default views;
}
