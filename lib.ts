import { AsyncLocalStorage } from "async_hooks";
import { createContext } from "unctx";

type Route<TContext> = {
	GET?: (ctx: TContext) => Promise<Response>;
	POST?: (ctx: TContext) => Promise<Response>;
	PUT?: (ctx: TContext) => Promise<Response>;
	DELETE?: (ctx: TContext) => Promise<Response>;
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

	constructor(options: {
		createContext: (req: Request) => TContext;
		pagesDirectory?: string;
	}) {
		this.router = new Bun.FileSystemRouter({
			dir: options?.pagesDirectory ?? "./pages",
			style: "nextjs",
		});
		this.createContext = options?.createContext;
	}

	public ctx() {
		return useCtx as () => TContext;
	}

	async fetch(req: Request): Promise<Response> {
		const ctx = this.createContext(req);
		const matched = this.router.match(req);

		if (!matched) {
			throw new Error(`No matching route for ${req.method} ${req.url}`);
		}
		const imported = (await import(matched.filePath)) as Route<TContext>;
		const method = req.method as keyof Route<TContext>;
		if (method in imported) {
			const handler = imported[method];
			if (handler)
				return context.call(ctx, () => {
					return handler(ctx);
				});
		}
		throw new Error("Method not allowed");
	}
}
