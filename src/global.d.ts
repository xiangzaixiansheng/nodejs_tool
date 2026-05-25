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

declare module '@koa/multer' {
    import { Middleware } from 'koa';

    interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
    }

    interface StorageEngine {
        _handleFile(req: any, file: any, cb: (error?: any, info?: Partial<File>) => void): void;
        _removeFile(req: any, file: any, cb: (error: Error | null) => void): void;
    }

    interface DiskStorageOptions {
        destination?: string | ((req: any, file: any, cb: (error: Error | null, destination: string) => void) => void);
        filename?: (req: any, file: any, cb: (error: Error | null, filename: string) => void) => void;
    }

    interface Options {
        storage?: StorageEngine;
        limits?: {
            fieldNameSize?: number;
            fieldSize?: number;
            fields?: number;
            fileSize?: number;
            files?: number;
            parts?: number;
            headerPairs?: number;
        };
        fileFilter?: (req: any, file: any, cb: (error: Error | null, acceptFile: boolean) => void) => void;
    }

    interface MulterInstance {
        single(fieldname: string): Middleware;
        array(fieldname: string, maxCount?: number): Middleware;
        fields(fields: Array<{ name: string; maxCount?: number }>): Middleware;
        none(): Middleware;
        any(): Middleware;
    }

    function multer(options?: Options): MulterInstance;

    namespace multer {
        function diskStorage(options: DiskStorageOptions): StorageEngine;
        function memoryStorage(): StorageEngine;
    }

    export default multer;
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
