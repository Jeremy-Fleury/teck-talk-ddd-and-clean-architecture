import type { UserRepository } from "@/modules-business/user/domain/repositories/user.repository";
export declare abstract class UnitOfWorkContextService {
	abstract user: UserRepository;
}
