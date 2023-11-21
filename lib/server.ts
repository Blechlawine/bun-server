import { AsyncLocalStorage } from "async_hooks";
import type { Serve } from "bun";
import { createContext } from "unctx";
import { IntoResponse, MaybePromise } from "./types";
import { Router } from ".";
import { JsonResponse, ResponseParser } from "./response";
import { HandlerWrapper, UnCtxHandlerWrapper } from "./wrapper";

const context = createContext({
	asyncContext: true,
	AsyncLocalStorage,
});
const useCtx = context.use;

export class Server<TContext extends Record<string, unknown>> {
	private router;
	private responseParser;
	private handlerWrapper;
	private createContext: (req: Request) => TContext;
	private errorHandler?: (err: Error) => MaybePromise<IntoResponse>;

	constructor(options: {
		createContext: (req: Request) => TContext;
		error?: (err: Error) => MaybePromise<IntoResponse>;
		router: Router<TContext>;
		responseParser?: ResponseParser;
		handlerWrapper?: HandlerWrapper<TContext>;
		routesDirectory?: string;
	}) {
		this.router = options.router;
		this.responseParser = options.responseParser ?? new JsonResponse();
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
		const parsed = this.responseParser.parse(result);
		return parsed;
	}

	async fetch(req: Request): Promise<Response> {
		const ctx = this.createContext(req);

		const handler = await this.router.match(req);

		const response = await this.handlerWrapper.wrap(handler)(ctx);

		const parsedResponse = this.responseParser.parse(response);

		return parsedResponse;
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
