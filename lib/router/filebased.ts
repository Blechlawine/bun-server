import { Route } from "../types";
import { Handler, Router } from "./router";

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
