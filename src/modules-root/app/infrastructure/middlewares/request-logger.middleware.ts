import { Injectable, Logger } from '@nestjs/common';
import type { NestMiddleware } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
	private readonly _logger = new Logger(RequestLoggerMiddleware.name);

	use(req: FastifyRequest, _res: FastifyReply, next: () => void): void {
		req.host;
		this._logger.debug(
			[
				'\n▶ Incoming request',
				req.host ? `  - host: ${req.host}` : undefined,
				req.method ? `  - method: ${req.method}` : undefined,
				req.hostname ? `  - hostname: ${req.hostname}` : undefined,
				req.originalUrl ? `  - originalUrl: ${req.originalUrl}` : undefined,
				req.query ? `  - query: ${this._safeStringify(req.query)}` : undefined,
				req.params ? `  - params: ${this._safeStringify(req.params)}` : undefined,
				req.body ? `  - body: ${this._safeStringify(req.body)}` : undefined,
			]
				.filter(Boolean)
				.join('\n'),
		);

		next();
	}

	private _safeStringify(value: unknown): string {
		if (value === undefined) {
			return 'undefined';
		}

		if (typeof value === 'string') {
			return value;
		}

		try {
			return JSON.stringify(value);
		} catch {
			return '[unserializable]';
		}
	}
}
