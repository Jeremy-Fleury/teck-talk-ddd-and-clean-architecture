import type { Provider } from '@nestjs/common';

import { PRISMA_UNIT_OF_WORK_TOKEN } from '@/modules-root/database/infrastructure/dependency-injection/database.token';
import type { UnitOfWorkService } from '@/modules-root/database/domain/services/unit-of-work.service';

import { GetOrCreateUserUseCase } from '@/modules-business/user/application/get-or-create-user.use-case';

import { GET_OR_CREATE_USER_USE_CASE_TOKEN } from './user.token';

export const GET_OR_CREATE_USER_USE_CASE_PROVIDER: Provider<GetOrCreateUserUseCase> = {
	inject: [PRISMA_UNIT_OF_WORK_TOKEN],
	provide: GET_OR_CREATE_USER_USE_CASE_TOKEN,
	useFactory: (unitOfWork: UnitOfWorkService) => {
		return new GetOrCreateUserUseCase(unitOfWork);
	},
};
