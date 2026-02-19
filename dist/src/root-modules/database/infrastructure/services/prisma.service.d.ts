import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

import { PrismaClient } from "@/modules-root/database/infrastructure/prisma-client/client";
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	private readonly _logger;
	constructor(configService: ConfigService);
	onModuleInit(): Promise<void>;
	onModuleDestroy(): Promise<void>;
}
