import type { UnitOfWorkService } from "@/modules-root/database/domain/services/unit-of-work.service";
import type { UnitOfWorkContextService } from "@/modules-root/database/domain/services/unit-of-work-context.service";
import type { PrismaService } from "./prisma.service";
export declare class UnitOfWorkPrismaService implements UnitOfWorkService {
	private readonly _prismaService;
	constructor(_prismaService: PrismaService);
	execute<TResult>(callback: (context: UnitOfWorkContextService) => Promise<TResult>): Promise<TResult>;
}
