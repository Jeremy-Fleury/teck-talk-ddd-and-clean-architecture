/** biome-ignore-all lint/style/useNamingConvention: Bypass naming convention for decorator */

import { createParamDecorator, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';

import type { User } from '@/modules-business/user/domain/aggregates/user.aggregate';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): User => {
	const req = ctx.switchToHttp().getRequest();
	const user = req.user;

	if (!user) {
		throw new UnauthorizedException('User not found on request');
	}

	return user;
});
