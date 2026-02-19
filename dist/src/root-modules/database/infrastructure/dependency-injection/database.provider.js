"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRISMA_UNIT_OF_WORK_PROVIDER = exports.PRISMA_SERVICE_PROVIDER = void 0;
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../services/prisma.service");
const prisma_unit_of_work_service_1 = require("../services/prisma-unit-of-work.service");
const database_token_1 = require("./database.token");
exports.PRISMA_SERVICE_PROVIDER = {
    inject: [config_1.ConfigService],
    provide: database_token_1.PRISMA_SERVICE_TOKEN,
    useFactory: (configService) => new prisma_service_1.PrismaService(configService),
};
exports.PRISMA_UNIT_OF_WORK_PROVIDER = {
    inject: [database_token_1.PRISMA_SERVICE_TOKEN],
    provide: database_token_1.PRISMA_UNIT_OF_WORK_TOKEN,
    useFactory: (prismaService) => new prisma_unit_of_work_service_1.UnitOfWorkPrismaService(prismaService),
};
//# sourceMappingURL=database.provider.js.map