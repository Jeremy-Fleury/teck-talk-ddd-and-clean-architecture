export abstract class InfrastructureError extends Error {
	readonly payload: Record<string, unknown>;

	constructor(message: string, payload: Record<string, unknown> = {}) {
		super(message);
		this.name = this.constructor.name;
		this.payload = payload;
	}
}

export class ValidationInfrastructureError extends InfrastructureError {}
export class RequiredFieldInfrastructureError extends InfrastructureError {}
