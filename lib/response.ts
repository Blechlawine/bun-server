export abstract class IntoResponse {
	abstract intoResponse(): Response;
}

export class Json<TData> extends IntoResponse {
	constructor(private data: TData) {
		super();
	}

	intoResponse(): Response {
		return new Response(JSON.stringify(this.data), {
			headers: {
				"content-type": "application/json",
			},
		});
	}
}

export class HTML extends IntoResponse {
	constructor(private html: string) {
		super();
	}

	intoResponse(): Response {
		return new Response(this.html, {
			headers: {
				"content-type": "text/html",
			},
		});
	}
}
