import type { User } from '@/modules-business/user/domain/aggregates/user.aggregate';
import type { Auth0JwtPayload } from '@/modules-business/user/infrastructure/types/jwt-payload.type';

declare module 'fastify' {
	interface FastifyRequest {
		user?: User | Auth0JwtPayload;
	}
}
