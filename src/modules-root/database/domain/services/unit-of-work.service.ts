import type { UnitOfWorkContextService } from './unit-of-work-context.service';

export abstract class UnitOfWorkService {
	abstract execute<T>(callback: (context: UnitOfWorkContextService) => Promise<T>): Promise<T>;
}
