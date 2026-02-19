export declare abstract class DomainError extends Error {
	readonly payload: Record<string, unknown>;
	constructor(message: string, payload?: Record<string, unknown>);
}
export declare class InvalidTransitionDomainError extends DomainError {}
export declare class ValidationDomainError extends DomainError {}
