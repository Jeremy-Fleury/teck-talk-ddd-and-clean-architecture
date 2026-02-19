"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const swagger_1 = require("@nestjs/swagger");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const app_module_1 = require("../modules/app.module");
async function openApiExportCommand() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter(), {
        logger: false,
    });
    const packageJson = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.resolve)(process.cwd(), "package.json"), "utf-8"));
    const config = new swagger_1.DocumentBuilder()
        .setTitle(packageJson.name)
        .setDescription(packageJson.description)
        .setVersion(packageJson.version)
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    const outFile = (0, node_path_1.resolve)(process.cwd(), "openapi.json");
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(outFile), { recursive: true });
    (0, node_fs_1.writeFileSync)(outFile, JSON.stringify(document, null, 2), {
        encoding: "utf-8",
    });
    await app.close();
}
openApiExportCommand().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=openapi-export.command.js.map