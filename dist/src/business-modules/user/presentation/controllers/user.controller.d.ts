import type { User } from "@/modules-business/user/domain/aggregates/user.aggregate";
import type { UserOutputDto } from "@/modules-business/user/presentation/dto/outputs/user.output-dto";
export declare class UserController {
	user(currentUser: User): UserOutputDto;
}
