import { createRouter, toRouteMatcher } from "radix3";
import { Handler, Route } from "./types";

export interface Router<TContext> {
	match(req: Request): Promise<Handler<TContext>>;

	mount(router: Router<TContext>): void;
}

export class FileBasedRouter<TContext> implements Router<TContext> {
	private router;

	constructor(options?: {
		dir?: string;
		style?: "nextjs";
	}) {
		this.router = new Bun.FileSystemRouter({
			dir: options?.dir ?? "./pages",
			style: options?.style ?? "nextjs",
		});
	}

	async match(req: Request): Promise<Handler<TContext>> {
		const matched = this.router.match(req);
		if (!matched) {
			throw new Error(`Not found ${req.method} ${req.url}`);
		}
		const imported = (await import(matched.filePath)) as Route<TContext>;
		const method = req.method;
		if (method in imported) {
			const handler = imported[method];
			if (handler) return handler;
		} else if (
			method.toLowerCase() === "get" &&
			"default" in imported &&
			imported.default !== undefined
		) {
			const handler = imported.default;
			return handler;
		}
		throw new Error(`Method not allowed: ${req.method} on ${req.url}`);
	}

	mount(route: string, router: Router<TContext>): void {
		throw new Error("Method not implemented.");
	}
}

export class RadixRouter<TContext> implements Router<TContext> {
	private router;

	constructor() {
		this.router = createRouter();
	}

	async match(req: Request): Promise<Handler<TContext>> {
		const url = new URL(req.url);
		const routeMatcher = toRouteMatcher(this.router);
		const matches = routeMatcher.matchAll(url.pathname);
		if (!matches.length) {
			throw new Error(`Not found ${req.method} ${req.url}`);
		}
		for (const match of matches) {
			if (match.method === req.method) {
				return match.handler;
			}
		}
		throw new Error(`Method not allowed: ${req.method} on ${req.url}`);
	}

	mount(route: string, router: Router<TContext>): void {
		throw new Error("Method not implemented.");
	}
}
