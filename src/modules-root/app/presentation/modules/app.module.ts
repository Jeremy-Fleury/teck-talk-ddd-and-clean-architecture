import { Module } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';

import { RequestLoggerMiddleware } from '@/modules-root/app/infrastructure/middlewares/request-logger.middleware';
import { AppController } from '@/modules-root/app/presentation/controllers/app.controller';
import { DatabaseModule } from '@/modules-root/database/presentation/modules/database.module';
import { EnvModule } from '@/modules-root/env/presentation/modules/env.module';

import { UserModule } from '@/modules-business/user/presentation/modules/user.module';

const forRootImports = [EnvModule.forRoot(), DatabaseModule.forRoot()];

const staticImports = [UserModule];

@Module({
	controllers: [AppController],
	imports: [...forRootImports, ...staticImports],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(RequestLoggerMiddleware).forRoutes('*');
	}
}
