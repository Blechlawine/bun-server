import { UseContext } from "unctx";
import { Handler } from ".";

export interface HandlerWrapper<TContext> {
	wrap(handler: Handler<TContext>): Handler<TContext>;
}

export class UnCtxHandlerWrapper<TContext> implements HandlerWrapper<TContext> {
	constructor(private context: UseContext<TContext>) {}

	wrap(handler: Handler<TContext>): Handler<TContext> {
		return (ctx: TContext) => {
			return this.context.call(ctx, () => handler(ctx));
		};
	}
}
