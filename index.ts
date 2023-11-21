import { Server, RadixRouter, FileBasedRouter, InferContext } from "./lib";

const router = new RadixRouter<Context>();

function createContext(req: Request) {
    return {
        request: req,
    };
}
const server = new Server<InferContext<typeof createContext>>({
    createContext,
    error: (err) => {
        return {
            message: err.message,
        };
    },
    router,
});

export type Context = InferContext<typeof createContext>;
export const useCtx = server.ctx();

router.mount(new FileBasedRouter());

export default server.intoBunServer(3000);
