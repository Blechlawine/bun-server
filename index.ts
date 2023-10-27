import { type InferContext, Server } from "./lib";

const server = new Server({
	createContext: (req) => {
		return {
			request: req,
		};
	},
});

export type Context = InferContext<Server>;
export const useCtx = server.ctx();

export default {
	port: 3000,
	fetch(req: Request) {
		return server.fetch(req);
	},
};
