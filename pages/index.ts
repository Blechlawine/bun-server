import { Context, useCtx } from "..";
import { HTML, Handler, defineRoute } from "../lib";

const route = defineRoute({
    GET: new Handler<Context>()
        .body((input) => ({
            hello: "world",
        }))
        .handle(async (context) => {
            // The context is passed into this function as the first parameter, or you can use it anywhere with useCtx (though you need to export that manually from your server to get typesafety)
            const ctx = useCtx();
            return new HTML("Hello world");
        }),
});

export default route;
