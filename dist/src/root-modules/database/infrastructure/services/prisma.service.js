"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../prisma-client/client");
class PrismaService extends client_1.PrismaClient {
    _logger = new common_1.Logger(PrismaService.name);
    constructor(configService) {
        super({
            adapter: new adapter_pg_1.PrismaPg({
                connectionString: configService.get("DATABASE_URL"),
            }),
            log: [
                { emit: "event", level: "error" },
                { emit: "event", level: "warn" },
            ],
        });
        const prismaWithEvents = this;
        prismaWithEvents.$on("error", (event) => {
            const logEvent = event;
            this._logger.error(`Prisma error: ${logEvent.message}`);
        });
        prismaWithEvents.$on("warn", (event) => {
            const logEvent = event;
            this._logger.warn(`Prisma warn: ${logEvent.message}`);
        });
    }
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
exports.PrismaService = PrismaService;
//# sourceMappingURL=prisma.service.js.map