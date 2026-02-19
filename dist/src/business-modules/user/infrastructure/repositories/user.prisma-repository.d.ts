import type { User } from "@/modules-business/user/domain/aggregates/user.aggregate";
import type { UserRepository } from "@/modules-business/user/domain/repositories/user.repository";
import type { Auth0Id } from "@/modules-business/user/domain/value-objects/auth0Id.vo";

import type { Prisma } from "@/modules-root/database/infrastructure/prisma-client/client";
export declare class UserPrismaRepository implements UserRepository {
	private readonly _prisma;
	constructor(_prisma: Prisma.TransactionClient);
	getByAuth0Id(auth0Id: Auth0Id): Promise<User | null>;
	create(user: User): Promise<void>;
}
