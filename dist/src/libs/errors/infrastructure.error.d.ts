export declare abstract class InfrastructureError extends Error {
	readonly payload: Record<string, unknown>;
	constructor(message: string, payload?: Record<string, unknown>);
}
export declare class ValidationInfrastructureError extends InfrastructureError {}
export declare class RequiredFieldInfrastructureError extends InfrastructureError {}
