import { Inject, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import JwksRsa from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { FastifyRequest } from 'fastify';

import { GET_OR_CREATE_USER_USE_CASE_TOKEN } from '@/modules-business/user/infrastructure/dependency-injection/user.token';
import type { GetOrCreateUserUseCase } from '@/modules-business/user/application/get-or-create-user.use-case';
import type { User } from '@/modules-business/user/domain/aggregates/user.aggregate';

type JwtPayload = {
	sub: string;
	email?: string;
	name?: string;
};

export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject(ConfigService) configService: ConfigService,
		@Inject(GET_OR_CREATE_USER_USE_CASE_TOKEN)
		private readonly _getOrCreateUserUseCase: GetOrCreateUserUseCase,
	) {
		const NODE_ENV = configService.get<string>('NODE_ENV');

		if (NODE_ENV === 'openapi') {
			super({
				algorithms: ['RS256'],
				audience: 'openapi',
				issuer: 'https://fake-issuer-url.com/',
				jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
				passReqToCallback: true,
				secretOrKeyProvider: JwksRsa.passportJwtSecret({
					cache: true,
					jwksRequestsPerMinute: 5,
					jwksUri: 'https://fake-jwks-uri.com/.well-known/jwks.json',
					rateLimit: true,
				}),
			});
			return;
		}

		const ISSUER_URL = configService.get<string>('AUTH0_ISSUER_URL') ?? 'https://fake-issuer-url.com/'; // warn: this is a fake issuer url for the openapi mode
		const AUDIENCE = configService.get<string>('AUTH0_AUDIENCE') ?? 'openapi'; // warn: this is a fake audience for the openapi mode

		if (!(ISSUER_URL && AUDIENCE)) {
			throw new Error('AUTH0_ISSUER_URL and AUTH0_AUDIENCE must be configured.');
		}

		const normalizedIssuer = ISSUER_URL.endsWith('/') ? ISSUER_URL : `${ISSUER_URL}/`;

		super({
			algorithms: ['RS256'],
			audience: AUDIENCE,
			issuer: normalizedIssuer,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			passReqToCallback: true,
			secretOrKeyProvider: JwksRsa.passportJwtSecret({
				cache: true,
				jwksRequestsPerMinute: 5,
				jwksUri: `${normalizedIssuer}.well-known/jwks.json`,
				rateLimit: true,
			}),
		});
	}

	async validate(_request: FastifyRequest, payload: JwtPayload): Promise<User | JwtPayload | { message: string }> {
		const externalId = payload.sub;

		const user = await this._getOrCreateUserUseCase.execute(externalId);

		if (!user) {
			throw new InternalServerErrorException('An error occurred while fetching the user');
		}

		return user;
	}
}
