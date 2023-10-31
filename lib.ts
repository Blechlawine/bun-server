import { AsyncLocalStorage } from "async_hooks";
import type { Serve } from "bun";
import { createContext } from "unctx";

type IntoResponse<T extends Record<string, unknown> = Record<string, unknown>> =
	| Response
	| T
	| string;
export type MaybePromise<T> = T | Promise<T>;

type Route<TContext> =
	| {
			[key: string]: (ctx: TContext) => Promise<IntoResponse>;
	  } & {
			default?: (ctx: TContext) => Promise<IntoResponse>;
	  };

export type InferContext<T extends Server> = T extends Server<infer C>
	? C
	: never;

const context = createContext({
	asyncContext: true,
	AsyncLocalStorage,
});
const useCtx = context.use;

export class Server<
	TContext extends Record<string, unknown> = {
		request: Request;
	},
> {
	private router;
	private createContext: (req: Request) => TContext;
	private errorHandler?: (err: Error) => MaybePromise<IntoResponse>;

	constructor(options: {
		createContext: (req: Request) => TContext;
		error?: (err: Error) => MaybePromise<IntoResponse>;
		pagesDirectory?: string;
	}) {
		this.router = new Bun.FileSystemRouter({
			dir: options?.pagesDirectory ?? "./pages",
			style: "nextjs",
		});
		this.errorHandler = options?.error;
		this.createContext = options?.createContext;
	}

	public ctx() {
		return useCtx as () => TContext;
	}

	async error(err: Error): Promise<Response> {
		if (!this.errorHandler) throw err;
		const result = this.errorHandler(err);
		if (result instanceof Response) return result;
		if (typeof result === "string") return new Response(result);
		return new Response(JSON.stringify(result), {
			headers: {
				"content-type": "application/json",
			},
		});
	}

	async fetch(req: Request): Promise<Response> {
		const ctx = this.createContext(req);
		const matched = this.router.match(req);

		if (!matched) {
			throw new Error(`No matching route for ${req.method} ${req.url}`);
		}
		const imported = (await import(matched.filePath)) as Route<TContext>;
		const method = req.method;
		if (method in imported) {
			const handler = imported[method];
			if (handler)
				return context.call(ctx, async () => {
					const result = await handler(ctx);
					if (result instanceof Response) return result;
					if (typeof result === "string") return new Response(result);
					return new Response(JSON.stringify(result), {
						headers: {
							"content-type": "application/json",
						},
					});
				});
		} else if (
			method.toLowerCase() === "get" &&
			"default" in imported &&
			imported.default !== undefined
		) {
			const handler = imported.default;
			return context.call(ctx, async () => {
				const result = await handler(ctx);
				if (result instanceof Response) return result;
				if (typeof result === "string") return new Response(result);
				return new Response(JSON.stringify(result), {
					headers: {
						"content-type": "application/json",
					},
				});
			});
		}
		throw new Error(`Method not allowed: ${method} on ${req.url}`);
	}
}

export function intoBunServer(server: Server, port?: number): Serve {
	return {
		port,
		fetch(req: Request) {
			return server.fetch(req);
		},
		error(err: Error) {
			return server.error(err);
		},
	};
}
