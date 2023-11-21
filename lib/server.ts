import { AsyncLocalStorage } from "async_hooks";
import type { Serve } from "bun";
import { createContext } from "unctx";
import { MaybePromise, PossibleResponse } from "./types";
import { Router } from ".";
import { IntoResponse, Json } from "./response";
import { HandlerWrapper, UnCtxHandlerWrapper } from "./wrapper";

const context = createContext({
	asyncContext: true,
	AsyncLocalStorage,
});
const useCtx = context.use;

export class Server<TContext extends Record<string, unknown>> {
	private router;
	private handlerWrapper;
	private createContext: (req: Request) => TContext;
	private errorHandler?: (err: Error) => MaybePromise<PossibleResponse>;

	constructor(options: {
		createContext: (req: Request) => TContext;
		error?: (err: Error) => MaybePromise<PossibleResponse>;
		router: Router<TContext>;
		handlerWrapper?: HandlerWrapper<TContext>;
		routesDirectory?: string;
	}) {
		this.router = options.router;
		this.handlerWrapper =
			options.handlerWrapper ?? new UnCtxHandlerWrapper(context);
		this.errorHandler = options?.error;
		this.createContext = options?.createContext;
	}

	public ctx() {
		return useCtx as () => TContext;
	}

	async error(err: Error): Promise<Response> {
		if (!this.errorHandler) throw err;
		const result = await this.errorHandler(err);
		const parsed = this.parseResponse(result);
		return parsed;
	}

	async fetch(req: Request): Promise<Response> {
		const ctx = this.createContext(req);

		const handler = await this.router.match(req);

		const response = await this.handlerWrapper.wrap(handler)(ctx);

		const parsedResponse = this.parseResponse(response);

		return parsedResponse;
	}

	private parseResponse(response: PossibleResponse): Response {
		if (response instanceof Response) {
			return response;
		} else if (response instanceof IntoResponse) {
			return response.intoResponse();
		} else if (typeof response === "string") {
			return new Response(response);
		}
		return new Json(response).intoResponse();
	}

	public intoBunServer(port?: number): Serve {
		return {
			port,
			fetch: (req: Request) => {
				return this.fetch(req);
			},
			error: (err: Error) => {
				return this.error(err);
			},
		};
	}
}
