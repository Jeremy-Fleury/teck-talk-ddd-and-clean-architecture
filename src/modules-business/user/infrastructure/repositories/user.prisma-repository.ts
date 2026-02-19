import type { Prisma } from '@/modules-root/database/infrastructure/prisma-client/client';

import { User } from '@/modules-business/user/domain/aggregates/user.aggregate';
import type { UserRepository } from '@/modules-business/user/domain/repositories/user.repository';
import type { Auth0Id } from '@/modules-business/user/domain/value-objects/auth0Id.vo';

export class UserPrismaRepository implements UserRepository {
	constructor(private readonly _prisma: Prisma.TransactionClient) {}

	async getByAuth0Id(auth0Id: Auth0Id): Promise<User | null> {
		const user = await this._prisma.user.findUnique({
			where: {
				auth0Id: auth0Id.toString(),
			},
		});

		if (!user) {
			return null;
		}

		return User.fromPrimitives(user);
	}

	async create(user: User): Promise<void> {
		const primitives = user.toPrimitives();

		await this._prisma.user.create({
			data: {
				email: primitives.email,
				auth0Id: primitives.auth0Id,
				firstName: primitives.firstName,
				id: primitives.id,
				lastName: primitives.lastName,
			},
		});
	}
}
