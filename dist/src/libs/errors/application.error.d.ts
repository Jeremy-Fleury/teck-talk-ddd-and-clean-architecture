export declare abstract class ApplicationError extends Error {
	readonly payload: Record<string, unknown>;
	constructor(message: string, payload?: Record<string, unknown>);
}
export declare class RessourceAlreadyExistsApplicationError extends ApplicationError {}
export declare class RessourceNotFoundApplicationError extends ApplicationError {}
