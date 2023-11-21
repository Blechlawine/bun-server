import { createRouter, toRouteMatcher } from "radix3";
import { Handler, Route } from "./types";

export abstract class Router<TContext> {
	protected mountedRouters: Set<Router<TContext>> = new Set();

	protected matchMountedRouters(req: Request) {
		for (const r of this.mountedRouters) {
			const matched = r.match(req);
			if (matched) return matched;
		}
	}

	abstract match(req: Request): Promise<Handler<TContext>>;
	abstract mount(router: Router<TContext>): void;
}

export class FileBasedRouter<TContext> extends Router<TContext> {
	private router;

	constructor(options?: {
		dir?: string;
		style?: "nextjs";
	}) {
		super();
		this.router = new Bun.FileSystemRouter({
			dir: options?.dir ?? "./pages",
			style: options?.style ?? "nextjs",
		});
	}

	async match(req: Request): Promise<Handler<TContext>> {
		const matched = this.router.match(req);
		if (!matched) {
			const mountedMatch = this.matchMountedRouters(req);
			if (mountedMatch) return mountedMatch;
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
		const mountedMatch = this.matchMountedRouters(req);
		if (mountedMatch) return mountedMatch;
		throw new Error(`Method not allowed: ${req.method} on ${req.url}`);
	}

	mount(router: Router<TContext>): void {
		this.mountedRouters.add(router);
	}
}

export class RadixRouter<TContext> extends Router<TContext> {
	private router;

	constructor() {
		super();
		this.router = createRouter();
	}

	async match(req: Request): Promise<Handler<TContext>> {
		const url = new URL(req.url);
		const routeMatcher = toRouteMatcher(this.router);
		const matches = routeMatcher.matchAll(url.pathname);
		if (!matches.length) {
			const matched = this.matchMountedRouters(req);
			if (matched) return matched;
			throw new Error(`Not found ${req.method} ${req.url}`);
		}
		for (const match of matches) {
			if (match.method === req.method) {
				return match.handler;
			}
		}
		const matched = this.matchMountedRouters(req);
		if (matched) return matched;
		throw new Error(`Method not allowed: ${req.method} on ${req.url}`);
	}

	mount(router: Router<TContext>): void {
		this.mountedRouters.add(router);
	}
}
