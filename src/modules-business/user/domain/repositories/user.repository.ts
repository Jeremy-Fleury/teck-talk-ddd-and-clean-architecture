import type { User } from '@/modules-business/user/domain/aggregates/user.aggregate';
import type { Auth0Id } from '@/modules-business/user/domain/value-objects/auth0Id.vo';

export interface UserRepository {
	create(user: User): Promise<void>;
	getByAuth0Id(auth0Id: Auth0Id): Promise<User | null>;
}
