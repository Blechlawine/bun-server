import { Route, TFOutput, TransformerFunction } from "../types";

export abstract class Router<TContext> {
    protected mountedRouters: Set<Router<TContext>> = new Set();

    protected matchMountedRouters(req: Request): Promise<Handler<TContext>> | undefined {
        for (const r of this.mountedRouters) {
            const matched = r.match(req);
            if (matched) return matched;
        }
        return undefined;
    }

    abstract match(req: Request): Promise<Handler<TContext>>;
    abstract mount(router: Router<TContext>): void;
}

export function defineRoute<TContext>(route: Route<TContext>) {
    return route;
}

export class Handler<
    TContext,
    TBodyParser extends TransformerFunction<any, any> = any,
    TQueryParser extends TransformerFunction<any, any> = any,
    TParamsParser extends TransformerFunction<any, any> = any,
    THeaderParser extends TransformerFunction<any, any> = any,
    TCookieParser extends TransformerFunction<any, any> = any,
> {
    private bodyParser: TBodyParser | undefined;
    private queryParser: TQueryParser | undefined;
    private paramsParser: TParamsParser | undefined;
    private headerParser: THeaderParser | undefined;
    private cookieParser: TCookieParser | undefined;
    private handler: TransformerFunction<any, any> | undefined;

    body<T extends TBodyParser>(
        parser: T,
    ): Handler<TContext, T, TQueryParser, TParamsParser, THeaderParser, TCookieParser> {
        this.bodyParser = parser;
        return this as unknown as Handler<
            TContext,
            T,
            TQueryParser,
            TParamsParser,
            THeaderParser,
            TCookieParser
        >;
    }

    query<T extends TQueryParser>(
        parser: T,
    ): Handler<TContext, TBodyParser, T, TParamsParser, THeaderParser, TCookieParser> {
        this.queryParser = parser;
        return this as unknown as Handler<
            TContext,
            TBodyParser,
            T,
            TParamsParser,
            THeaderParser,
            TCookieParser
        >;
    }

    params<T extends TParamsParser>(
        parser: T,
    ): Handler<TContext, TBodyParser, TQueryParser, T, THeaderParser, TCookieParser> {
        this.paramsParser = parser;
        return this as unknown as Handler<
            TContext,
            TBodyParser,
            TQueryParser,
            T,
            THeaderParser,
            TCookieParser
        >;
    }

    header<T extends THeaderParser>(
        parser: T,
    ): Handler<TContext, TBodyParser, TQueryParser, TParamsParser, T, TCookieParser> {
        this.headerParser = parser;
        return this as unknown as Handler<
            TContext,
            TBodyParser,
            TQueryParser,
            TParamsParser,
            T,
            TCookieParser
        >;
    }

    cookie<T extends TCookieParser>(
        parser: T,
    ): Handler<TContext, TBodyParser, TQueryParser, TParamsParser, THeaderParser, T> {
        this.cookieParser = parser;
        return this as unknown as Handler<
            TContext,
            TBodyParser,
            TQueryParser,
            TParamsParser,
            THeaderParser,
            T
        >;
    }

    handle<
        T extends TransformerFunction<
            TContext & {
                body: TFOutput<TBodyParser>;
                query: TFOutput<TQueryParser>;
                params: TFOutput<TParamsParser>;
                headers: TFOutput<THeaderParser>;
                cookies: TFOutput<TCookieParser>;
            },
            any
        >,
    >(
        handler: T,
    ): Handler<TContext, TBodyParser, TQueryParser, TParamsParser, THeaderParser, TCookieParser> {
        this.handler = handler;
        return this as unknown as Handler<
            TContext,
            TBodyParser,
            TQueryParser,
            TParamsParser,
            THeaderParser,
            TCookieParser
        >;
    }

    async execute(ctx: TContext & { req: Request }) {
        const body = this.bodyParser?.(ctx.req.body);
        const query = this.queryParser?.(ctx.req.query);
        const params = this.paramsParser?.(ctx.req.params);
        const headers = this.headerParser?.(ctx.req.headers);
        const cookies = this.cookieParser?.(ctx.req.cookies);
        const handlerResponse = await this.handler?.({
            ...ctx,
            body,
            query,
            params,
            headers,
            cookies,
        });
        return handlerResponse;
    }
}
