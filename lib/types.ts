import { IntoResponse, type Server } from ".";

export type PossibleResponse<
	T extends Record<string, unknown> = Record<string, unknown>,
> = Response | T | string | IntoResponse;

export type MaybePromise<T> = T | Promise<T>;

export type Route<TContext> =
	| {
			[key: string]: (ctx: TContext) => Promise<PossibleResponse>;
	  } & {
			default?: (ctx: TContext) => Promise<PossibleResponse>;
	  };

export type InferContext<T extends Server<Record<string, unknown>>> =
	T extends Server<infer C> ? C : never;

export type Handler<TContext> = (ctx: TContext) => Promise<PossibleResponse>;
export type WrappedHandler<TContext> = (ctx: TContext) => Promise<Response>;
