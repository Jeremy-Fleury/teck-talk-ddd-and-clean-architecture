import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
export declare class HttpExceptionFilter implements ExceptionFilter {
	private readonly _logger;
	catch(exception: unknown, host: ArgumentsHost): void;
	private _mapExceptionToHttpResponse;
	private _getStatusForError;
	private _buildResponse;
}
