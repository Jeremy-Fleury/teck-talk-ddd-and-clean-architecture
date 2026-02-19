export abstract class ApplicationError extends Error {
	readonly payload: Record<string, unknown>;

	constructor(message: string, payload: Record<string, unknown> = {}) {
		super(message);
		this.name = this.constructor.name;
		this.payload = payload;
	}
}

export class RessourceAlreadyExistsApplicationError extends ApplicationError {}
export class RessourceNotFoundApplicationError extends ApplicationError {}
