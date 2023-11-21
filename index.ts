import { type InferContext, Server, RadixRouter } from "./lib";

const router = new RadixRouter();

function createContext(req: Request) {
	return {
		request: req,
	};
}
const server = new Server<ReturnType<typeof createContext>>({
	createContext,
	error: (err) => {
		return {
			message: err.message,
		};
	},
	router,
});

export type Context = InferContext<typeof server>;
export const useCtx = server.ctx();

export default server.intoBunServer(3000);
