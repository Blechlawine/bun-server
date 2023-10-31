import { type InferContext, Server, intoBunServer } from "./lib";

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
});

export type Context = InferContext<Server>;
export const useCtx = server.ctx();

export default intoBunServer(server);
