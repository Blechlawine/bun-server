import { Handler } from "../types";

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
