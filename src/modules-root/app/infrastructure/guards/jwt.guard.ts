import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '@/libs/decorators/public.decorator';
import { UnauthorizedPresentationError } from '@/libs/errors/presentation.error';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
	constructor(private readonly _reflector: Reflector) {
		super();
	}

	override canActivate(context: ExecutionContext) {
		const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

		if (isPublic) {
			return true;
		}

		return super.canActivate(context);
	}

	override handleRequest<T>(err: unknown, user: T): T {
		if (err || !user) {
			const message = 'Unauthorized';
			throw new UnauthorizedPresentationError(message);
		}

		return user;
	}
}
