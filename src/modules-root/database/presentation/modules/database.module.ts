import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';

import { PRISMA_SERVICE_PROVIDER, PRISMA_UNIT_OF_WORK_PROVIDER } from '@/modules-root/database/infrastructure/dependency-injection/database.provider';
import { PRISMA_SERVICE_TOKEN, PRISMA_UNIT_OF_WORK_TOKEN } from '@/modules-root/database/infrastructure/dependency-injection/database.token';

const DATABASE_MODULE_GUARD = Symbol('DATABASE_MODULE_GUARD');

@Module({})
export class DatabaseModule {
	private static _isRegistered = false;

	static forRoot(): DynamicModule {
		if (DatabaseModule._isRegistered) {
			throw new Error('DatabaseModule already registered');
		}

		DatabaseModule._isRegistered = true;

		return {
			exports: [PRISMA_SERVICE_TOKEN, PRISMA_UNIT_OF_WORK_TOKEN],
			global: true,
			imports: [],
			module: DatabaseModule,
			providers: [{ provide: DATABASE_MODULE_GUARD, useValue: true }, PRISMA_SERVICE_PROVIDER, PRISMA_UNIT_OF_WORK_PROVIDER],
		};
	}
}
