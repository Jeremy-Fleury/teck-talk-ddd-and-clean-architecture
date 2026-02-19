import type { UnitOfWorkService } from '@/modules-root/database/domain/services/unit-of-work.service';

import { User } from '@/modules-business/user/domain/aggregates/user.aggregate';
import { Auth0Id } from '@/modules-business/user/domain/value-objects/auth0Id.vo';

export class GetOrCreateUserUseCase {
	constructor(private readonly _unitOfWork: UnitOfWorkService) {}

	async execute(auth0Id: string): Promise<User> {
		return await this._unitOfWork.execute(async (context): Promise<User> => {
			let user: User | null = null;

			user = await context.user.getByAuth0Id(Auth0Id.create(auth0Id));

			if (user !== null) {
				return user;
			}

			user = User.create({
				email: null,
				auth0Id: auth0Id,
				firstName: null,
				lastName: null,
			});

			await context.user.create(user);

			return user;
		});
	}
}
