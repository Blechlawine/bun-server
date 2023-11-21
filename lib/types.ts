import { type Server } from ".";

export type IntoResponse<
	T extends Record<string, unknown> = Record<string, unknown>,
> = Response | T | string;
export type MaybePromise<T> = T | Promise<T>;

export type Route<TContext> =
	| {
			[key: string]: (ctx: TContext) => Promise<IntoResponse>;
	  } & {
			default?: (ctx: TContext) => Promise<IntoResponse>;
	  };

export type InferContext<T extends Server<any>> = T extends Server<infer C>
	? C
	: never;

export type Handler<TContext> = (ctx: TContext) => Promise<IntoResponse>;
export type WrappedHandler<TContext> = (ctx: TContext) => Promise<Response>;
