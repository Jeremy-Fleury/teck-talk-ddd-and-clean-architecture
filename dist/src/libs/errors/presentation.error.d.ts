export declare abstract class PresentationError extends Error {
	readonly payload: Record<string, unknown>;
	constructor(message: string, payload?: Record<string, unknown>);
}
export declare class DtoValidationPresentationError extends PresentationError {}
export declare class UnauthorizedPresentationError extends PresentationError {}
