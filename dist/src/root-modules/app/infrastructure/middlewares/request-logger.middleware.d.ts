import type { NestMiddleware } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
export declare class RequestLoggerMiddleware implements NestMiddleware {
	private readonly _logger;
	use(req: FastifyRequest, _res: FastifyReply, next: () => void): void;
	private _safeStringify;
}
