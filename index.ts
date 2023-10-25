import { createRouter, toRouteMatcher } from "radix3";

class Server<TContext extends Record<string, unknown> = {}> {
	private router;
	private createContext;

	constructor(options?: {
		createContext?: (req: Request) => TContext;
	}) {
		this.router = createRouter();
		this.createContext =
			options?.createContext ||
			((req) => {
				return {
					request: req,
				};
			});
	}

	get(path: string, handler: (ctx: TContext) => Response) {
		this.router.insert(path, {
			method: "GET",
			handler,
		});
	}

	post(path: string, handler: (ctx: TContext) => Response) {
		this.router.insert(path, {
			method: "POST",
			handler,
		});
	}

	bun(req: Request): Promise<Response> {
		const ctx = this.createContext(req);
		const url = new URL(req.url);
		const routeMatcher = toRouteMatcher(this.router);
		const matches = routeMatcher.matchAll(url.pathname);
		// const data = this.router.lookup(url.pathname);

		if (!matches.length) {
			throw new Error("No matching route");
		}
		for (const match of matches) {
			if (match.method === req.method) {
				return match.handler(ctx);
			}
		}
		throw new Error("Method not allowed");
	}
}

const server = new Server({
	createContext: (req) => {
		return {
			request: req,
		};
	},
});

server.post("/", (ctx) => {
	return new Response("Hello World", { status: 200 });
});

console.log("Listening on port:", 3000);
Bun.serve({
	port: 3000,
	fetch(req) {
		return server.bun(req);
	},
});
