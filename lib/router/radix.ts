import { createRouter, toRouteMatcher } from "radix3";
import { Router } from "./router";
import { Handler } from "../types";

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
