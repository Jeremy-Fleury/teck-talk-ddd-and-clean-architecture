export abstract class PresentationError extends Error {
	readonly payload: Record<string, unknown>;

	constructor(message: string, payload: Record<string, unknown> = {}) {
		super(message);
		this.name = this.constructor.name;
		this.payload = payload;
	}
}

export class DtoValidationPresentationError extends PresentationError {}
export class UnauthorizedPresentationError extends PresentationError {}
