import { Server } from "./lib";

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

export default {
	port: 3000,
	fetch(req: Request) {
		return server.fetch(req);
	},
};
