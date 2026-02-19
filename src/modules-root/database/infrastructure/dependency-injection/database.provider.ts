import { ConfigService } from '@nestjs/config';
import type { Provider } from '@nestjs/common';

import { PrismaService } from '@/modules-root/database/infrastructure/services/prisma.service';
import { UnitOfWorkPrismaService } from '@/modules-root/database/infrastructure/services/prisma-unit-of-work.service';

import { PRISMA_SERVICE_TOKEN, PRISMA_UNIT_OF_WORK_TOKEN } from './database.token';

export const PRISMA_SERVICE_PROVIDER: Provider<PrismaService> = {
	inject: [ConfigService],
	provide: PRISMA_SERVICE_TOKEN,
	useFactory: (configService: ConfigService) => new PrismaService(configService),
};

export const PRISMA_UNIT_OF_WORK_PROVIDER: Provider<UnitOfWorkPrismaService> = {
	inject: [PRISMA_SERVICE_TOKEN],
	provide: PRISMA_UNIT_OF_WORK_TOKEN,
	useFactory: (prismaService: PrismaService) => new UnitOfWorkPrismaService(prismaService),
};
