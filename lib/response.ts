import { IntoResponse } from ".";

export interface ResponseParser {
	parse(data: IntoResponse): Response;
}

export class JsonResponse implements ResponseParser {
	parse(data: IntoResponse): Response {
		if (data instanceof Response) return data;
		if (typeof data === "string") return new Response(data);
		return new Response(JSON.stringify(data), {
			headers: {
				"content-type": "application/json",
			},
		});
	}
}
