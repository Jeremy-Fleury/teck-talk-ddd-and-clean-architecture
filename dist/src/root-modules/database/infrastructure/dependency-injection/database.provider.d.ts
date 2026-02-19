import type { Provider } from "@nestjs/common";

import type { PrismaService } from "@/modules-root/database/infrastructure/services/prisma.service";
import type { UnitOfWorkPrismaService } from "@/modules-root/database/infrastructure/services/prisma-unit-of-work.service";
export declare const PRISMA_SERVICE_PROVIDER: Provider<PrismaService>;
export declare const PRISMA_UNIT_OF_WORK_PROVIDER: Provider<UnitOfWorkPrismaService>;
