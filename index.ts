import { type InferContext, Server, intoBunServer, RadixRouter } from "./lib";

const router = new RadixRouter();
const server = new Server({
	createContext: (req) => {
		return {
			request: req,
		};
	},
	error: (err) => {
		console.log("EROOROROROORORORORO", err);
		return {
			message: err.message,
		};
	},
	router,
});

export type Context = InferContext<Server>;
export const useCtx = server.ctx();

export default intoBunServer(server);
