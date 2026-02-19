import type { User } from "@/modules-business/user/domain/aggregates/user.aggregate";

import type { UnitOfWorkService } from "@/modules-root/database/domain/services/unit-of-work.service";
export declare class GetOrCreateUserUseCase {
	private readonly _unitOfWork;
	constructor(_unitOfWork: UnitOfWorkService);
	execute(auth0Id: string): Promise<User>;
}
