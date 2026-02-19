import type { UnitOfWorkContextService } from "./unit-of-work-context.service";
export declare abstract class UnitOfWorkService {
	abstract execute<TResult>(callback: (context: UnitOfWorkContextService) => Promise<TResult>): Promise<TResult>;
}
