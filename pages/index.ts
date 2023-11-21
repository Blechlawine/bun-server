import { type Context, useCtx } from "..";
import { HTML } from "../lib";

export default function GET(context: Context) {
	// The context is passed into this function as the first parameter, or you can use it anywhere with useCtx (though you need to export that manually from your server to get typesafety)
	const ctx = useCtx();
	return new HTML("Hello world");
}
