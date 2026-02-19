import { Catch, HttpStatus, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { FastifyReply } from 'fastify';

import { errorHttpStatusByError } from '@/modules-root/app/infrastructure/mappers/errors.mapper';

import { ApplicationError } from '@/libs/errors/application.error';
import { DomainError } from '@/libs/errors/domain.error';
import { InfrastructureError } from '@/libs/errors/infrastructure.error';
import { PresentationError } from '@/libs/errors/presentation.error';

type HttpErrorBody = {
	message: string;
	payload: Record<string, unknown>;
};

type HttpErrorResponse = {
	status: number;
	body: HttpErrorBody;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly _logger = new Logger(HttpExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<FastifyReply>();

		const { status, body } = this._mapExceptionToHttpResponse(exception);

		response.status(status).send(body);
	}

	private _mapExceptionToHttpResponse(exception: unknown): HttpErrorResponse {
		if (exception instanceof DomainError || exception instanceof ApplicationError || exception instanceof InfrastructureError || exception instanceof PresentationError) {
			const status = this._getStatusForError(exception) ?? HttpStatus.INTERNAL_SERVER_ERROR;
			const response = this._buildResponse(status, exception.message, exception.payload);
			this._logger.error(response);
			return response;
		}

		const response = this._buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'This error is not handled by the application', {});
		this._logger.error(response, exception);
		return response;
	}

	private _getStatusForError(error: Error): number | null {
		for (const [errorType, status] of errorHttpStatusByError.entries()) {
			if (error instanceof errorType) {
				return status;
			}
		}
		return null;
	}

	private _buildResponse(status: number, message: string, payload: Record<string, unknown>): HttpErrorResponse {
		return {
			body: {
				message,
				payload,
			},
			status,
		};
	}
}
