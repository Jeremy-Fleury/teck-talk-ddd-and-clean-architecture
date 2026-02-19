import type { UnitOfWorkService } from '@/modules-root/database/domain/services/unit-of-work.service';
import type { UnitOfWorkContextService } from '@/modules-root/database/domain/services/unit-of-work-context.service';
import type { Prisma } from '@/modules-root/database/infrastructure/prisma-client/client';

import { UserPrismaRepository } from '@/modules-business/user/infrastructure/repositories/user.prisma-repository';

import type { PrismaService } from './prisma.service';

export class UnitOfWorkPrismaService implements UnitOfWorkService {
	constructor(private readonly _prismaService: PrismaService) {}

	execute<T>(callback: (context: UnitOfWorkContextService) => Promise<T>): Promise<T> {
		return this._prismaService.$transaction((tx: Prisma.TransactionClient) => {
			const user = new UserPrismaRepository(tx);

			const context: UnitOfWorkContextService = {
				user,
			};

			return callback(context);
		});
	}
}
