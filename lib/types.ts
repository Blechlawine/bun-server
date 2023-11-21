import { Handler, IntoResponse } from ".";

export type PossibleResponse<T = any> = Response | T | string | IntoResponse;

export type InferContext<T extends ((req: Request) => any) | Record<string, any>> = T extends (
    req: Request,
) => infer U
    ? U & { req: Request }
    : T & { req: Request };

export type MaybePromise<T> = T | Promise<T>;

export type TransformerFunction<TInput, TOutput> = (input: TInput) => MaybePromise<TOutput>;
export type TFOutput<TF> = TF extends TransformerFunction<any, infer TOutput> ? TOutput : never;
export type TFInput<TF> = TF extends TransformerFunction<infer TInput, any> ? TInput : never;
export type WrappedHandler<TContext> = (ctx: TContext) => Promise<Response>;

export type Route<TContext> = {
    [method in HTTPMethod]?: Handler<TContext>;
};

export type HTTPMethod =
    | (string & {})
    | "ACL"
    | "BIND"
    | "CHECKOUT"
    | "CONNECT"
    | "COPY"
    | "DELETE"
    | "GET"
    | "HEAD"
    | "LINK"
    | "LOCK"
    | "M-SEARCH"
    | "MERGE"
    | "MKACTIVITY"
    | "MKCALENDAR"
    | "MKCOL"
    | "MOVE"
    | "NOTIFY"
    | "OPTIONS"
    | "PATCH"
    | "POST"
    | "PROPFIND"
    | "PROPPATCH"
    | "PURGE"
    | "PUT"
    | "REBIND"
    | "REPORT"
    | "SEARCH"
    | "SOURCE"
    | "SUBSCRIBE"
    | "TRACE"
    | "UNBIND"
    | "UNLINK"
    | "UNLOCK"
    | "UNSUBSCRIBE"
    | "ALL";
