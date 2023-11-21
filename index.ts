import { type InferContext, Server, RadixRouter, FileBasedRouter } from "./lib";

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

router.mount(new FileBasedRouter());

export default server.intoBunServer(3000);
