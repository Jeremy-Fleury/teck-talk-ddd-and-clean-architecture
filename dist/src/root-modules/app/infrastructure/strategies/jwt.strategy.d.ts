import type { ConfigService } from "@nestjs/config";
import type { FastifyRequest } from "fastify";
import type { Strategy } from "passport-jwt";

import type { GetOrCreateUserUseCase } from "@/modules-business/user/application/get-or-create-user.use-case";
import type { User } from "@/modules-business/user/domain/aggregates/user.aggregate";

type JwtPayload = {
	sub: string;
	email?: string;
	name?: string;
};
declare const JwtStrategyBase: new (
	...args:
		| [opt: import("passport-jwt").StrategyOptionsWithRequest]
		| [opt: import("passport-jwt").StrategyOptionsWithoutRequest]
) => Strategy & {
	validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategyBase {
	private readonly _getOrCreateUserUseCase;
	constructor(configService: ConfigService, _getOrCreateUserUseCase: GetOrCreateUserUseCase);
	validate(
		_request: FastifyRequest,
		payload: JwtPayload,
	): Promise<
		| User
		| JwtPayload
		| {
				message: string;
		  }
	>;
}
