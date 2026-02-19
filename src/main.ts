import { ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import type { INestApplication } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { OpenAPIObject } from '@nestjs/swagger';

import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { HttpExceptionFilter } from '@/modules-root/app/infrastructure/filters/http-exception.filter';
import { JwtGuard } from '@/modules-root/app/infrastructure/guards/jwt.guard';
import { StrictSerializerInterceptor } from '@/modules-root/app/infrastructure/interceptors/strict-serializer.interceptor';
import { createValidationPipe } from '@/modules-root/app/infrastructure/pipes/validation.pipe';
import { AppModule } from '@/modules-root/app/presentation/modules/app.module';

require('dd-trace').init({ logInjection: true });

function swaggerSetup(app: INestApplication): OpenAPIObject {
	const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'));
	const config = new DocumentBuilder().setTitle(packageJson.name).setDescription(packageJson.description).setVersion(packageJson.version).addBearerAuth().build();
	const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup('api', app, document, {
		customSiteTitle: packageJson.name,
		raw: ['json'],
		ui: false,
	});

	const outputPath = join(process.cwd(), 'openapi.json');
	writeFileSync(outputPath, JSON.stringify(document, null, 2), {
		encoding: 'utf-8',
	});

	return document;
}

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { snapshot: true });

	app.getHttpAdapter()
		.getInstance()
		.addContentTypeParser(/^multipart\/form-data/i, { parseAs: 'buffer' }, (_request: unknown, body: Buffer, done: (error: Error | null, parsedBody?: Buffer) => void) => {
			done(null, body);
		});

	const faviconPath = resolve(process.cwd(), 'public', 'favicon.svg');
	const faviconContent = readFileSync(faviconPath);

	app.getHttpAdapter()
		.getInstance()
		.get(
			'/favicon.ico',
			(
				_request: unknown,
				reply: {
					header: (key: string, value: string) => unknown;
					send: (body: Buffer) => void;
				},
			) => {
				reply.header('Content-Type', 'image/svg+xml');
				reply.header('Cache-Control', 'public, max-age=86400');
				reply.send(faviconContent);
			},
		);

	const configService = app.get(ConfigService);

	const NODE_ENV = configService.get<string>('NODE_ENV');
	const PORT = configService.get<number>('PORT');
	const DEFAULT_PORT = 3000;

	app.useLogger(
		new ConsoleLogger({
			json: NODE_ENV !== 'local',
			logLevels: NODE_ENV === 'local' ? ['verbose', 'debug', 'log', 'warn', 'error', 'fatal'] : ['log', 'warn', 'error', 'fatal'],
			timestamp: true,
		}),
	);

	const reflector = app.get(Reflector);

	app.useGlobalGuards(new JwtGuard(reflector));
	app.useGlobalPipes(createValidationPipe());
	app.useGlobalFilters(new HttpExceptionFilter());
	app.useGlobalInterceptors(new StrictSerializerInterceptor());

	app.enableCors({
		credentials: true,
		origin: true,
	});

	const document = swaggerSetup(app);

	app.use(
		'/docs',
		apiReference({
			content: document,
			withFastify: true,
		}),
	);

	await app.init();

	await app.listen(PORT ?? DEFAULT_PORT, '0.0.0.0');
}

bootstrap();
