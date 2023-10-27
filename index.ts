import { type InferContext, Server } from "./lib";

const server = new Server({
	createContext: (req) => {
		return {
			request: req,
		};
	},
});

export type Context = InferContext<Server>;

export default {
	port: 3000,
	fetch(req: Request) {
		return server.fetch(req);
	},
};
