import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import type { DynamicModule } from '@nestjs/common';

import { envValidationService } from '@/modules-root/env/infrastructure/services/env.service';

@Module({})
export class EnvModule {
	static forRoot(): DynamicModule {
		return {
			exports: [],
			global: true,
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					validate: envValidationService,
				}),
			],
			module: EnvModule,
		};
	}
}
