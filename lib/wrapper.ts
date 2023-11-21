import { UseContext } from "unctx";
import { TransformerFunction } from "./types";

export interface HandlerWrapper<TInput = any, TOutput = any> {
    wrap(fn: TransformerFunction<TInput, TOutput>): TransformerFunction<TInput, TOutput>;
}

export class UnCtxHandlerWrapper<TInput, TOutput> implements HandlerWrapper<TInput, TOutput> {
    constructor(private context: UseContext<TInput>) {}

    wrap(fn: TransformerFunction<TInput, TOutput>): TransformerFunction<TInput, TOutput> {
        return (ctx: TInput) => {
            return this.context.call(ctx, () => fn(ctx));
        };
    }
}
