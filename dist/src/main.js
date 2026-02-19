"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const swagger_1 = require("@nestjs/swagger");
const nestjs_api_reference_1 = require("@scalar/nestjs-api-reference");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const http_exception_filter_1 = require("./modules-root/app/infrastructure/filters/http-exception.filter");
const jwt_guard_1 = require("./modules-root/app/infrastructure/guards/jwt.guard");
const strict_serializer_interceptor_1 = require("./modules-root/app/infrastructure/interceptors/strict-serializer.interceptor");
const validation_pipe_1 = require("./modules-root/app/infrastructure/pipes/validation.pipe");
const app_module_1 = require("./modules-root/app/presentation/modules/app.module");
require("dd-trace").init({ logInjection: true });
function swaggerSetup(app) {
	const packageJson = JSON.parse(
		(0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "package.json"), "utf-8"),
	);
	const config = new swagger_1.DocumentBuilder()
		.setTitle(packageJson.name)
		.setDescription(packageJson.description)
		.setVersion(packageJson.version)
		.addBearerAuth()
		.build();
	const document = swagger_1.SwaggerModule.createDocument(app, config);
	swagger_1.SwaggerModule.setup("api", app, document, {
		customSiteTitle: packageJson.name,
		raw: ["json"],
		ui: false,
	});
	const outputPath = (0, node_path_1.join)(process.cwd(), "openapi.json");
	(0, node_fs_1.writeFileSync)(outputPath, JSON.stringify(document, null, 2), {
		encoding: "utf-8",
	});
	return document;
}
async function bootstrap() {
	const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter(), {
		snapshot: true,
	});
	app.getHttpAdapter()
		.getInstance()
		.addContentTypeParser(/^multipart\/form-data/i, { parseAs: "buffer" }, (_request, body, done) => {
			done(null, body);
		});
	const faviconPath = (0, node_path_1.resolve)(process.cwd(), "public", "favicon.svg");
	const faviconContent = (0, node_fs_1.readFileSync)(faviconPath);
	app.getHttpAdapter()
		.getInstance()
		.get("/favicon.ico", (_request, reply) => {
			reply.header("Content-Type", "image/svg+xml");
			reply.header("Cache-Control", "public, max-age=86400");
			reply.send(faviconContent);
		});
	const configService = app.get(config_1.ConfigService);
	const NODE_ENV = configService.get("NODE_ENV");
	const PORT = configService.get("PORT");
	const DEFAULT_PORT = 3000;
	app.useLogger(
		new common_1.ConsoleLogger({
			json: NODE_ENV !== "local",
			logLevels:
				NODE_ENV === "local"
					? ["verbose", "debug", "log", "warn", "error", "fatal"]
					: ["log", "warn", "error", "fatal"],
			timestamp: true,
		}),
	);
	const reflector = app.get(core_1.Reflector);
	app.useGlobalGuards(new jwt_guard_1.JwtGuard(reflector));
	app.useGlobalPipes((0, validation_pipe_1.createValidationPipe)());
	app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
	app.useGlobalInterceptors(new strict_serializer_interceptor_1.StrictSerializerInterceptor());
	app.enableCors({
		credentials: true,
		origin: true,
	});
	const document = swaggerSetup(app);
	app.use(
		"/docs",
		(0, nestjs_api_reference_1.apiReference)({
			content: document,
			withFastify: true,
		}),
	);
	await app.init();
	await app.listen(PORT ?? DEFAULT_PORT, "0.0.0.0");
}
void bootstrap();
//# sourceMappingURL=main.js.map
