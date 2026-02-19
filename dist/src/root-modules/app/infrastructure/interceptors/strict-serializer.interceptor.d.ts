import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import type { Observable } from "rxjs";
export declare class StrictSerializerInterceptor implements NestInterceptor {
	private static readonly _CLASS_TRANSFORM_OPTIONS;
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
	private _getResponseType;
	private _transformRecursive;
	private _validateRecursive;
	private _validateSingleItem;
	private _getHandlerInfo;
	private _formatValidationErrors;
}
