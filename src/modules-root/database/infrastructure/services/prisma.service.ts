import { Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

import { PrismaClient } from '@/modules-root/database/infrastructure/prisma-client/client';
import type { Prisma } from '@/modules-root/database/infrastructure/prisma-client/client';

type PrismaEventClient = {
	// biome-ignore lint/style/useNamingConvention: Biome is not able to detect the correct naming convention for this file
	$on: (eventType: 'query' | 'error' | 'warn', callback: (event: Prisma.QueryEvent | Prisma.LogEvent) => void) => void;
};

export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	private readonly _logger = new Logger(PrismaService.name);

	constructor(configService: ConfigService) {
		super({
			adapter: new PrismaPg({
				connectionString: configService.get<string>('DATABASE_URL'),
			}),
			log: [
				{ emit: 'event', level: 'error' },
				{ emit: 'event', level: 'warn' },
			],
		});

		const prismaWithEvents = this as unknown as PrismaEventClient;

		prismaWithEvents.$on('error', (event) => {
			const logEvent = event as Prisma.LogEvent;
			this._logger.error(`Prisma error: ${logEvent.message}`);
		});

		prismaWithEvents.$on('warn', (event) => {
			const logEvent = event as Prisma.LogEvent;
			this._logger.warn(`Prisma warn: ${logEvent.message}`);
		});
	}

	async onModuleInit(): Promise<void> {
		await this.$connect();
	}

	async onModuleDestroy(): Promise<void> {
		await this.$disconnect();
	}
}
