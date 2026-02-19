import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { Serialize } from '@/modules-root/app/infrastructure/decorators/serialize.decorator';

import { UserOutputDto } from '@/modules-business/user/presentation/dto/outputs/user.output-dto';
import type { User } from '@/modules-business/user/domain/aggregates/user.aggregate';

import { CurrentUser } from '@/libs/decorators/current-user.decorator';

@Controller('user')
@ApiBearerAuth()
export class UserController {
	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Current user found and returned.',
		type: UserOutputDto,
	})
	@Serialize(UserOutputDto)
	user(@CurrentUser() currentUser: User): UserOutputDto {
		return currentUser.toPrimitives();
	}
}
