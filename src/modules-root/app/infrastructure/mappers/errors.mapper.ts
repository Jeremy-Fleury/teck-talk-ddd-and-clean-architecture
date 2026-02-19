import { HttpStatus } from '@nestjs/common';

import { RessourceAlreadyExistsApplicationError, RessourceNotFoundApplicationError } from '@/libs/errors/application.error';
import { InvalidTransitionDomainError, ValidationDomainError } from '@/libs/errors/domain.error';
import { ValidationInfrastructureError } from '@/libs/errors/infrastructure.error';
import { DtoValidationPresentationError, UnauthorizedPresentationError } from '@/libs/errors/presentation.error';

type ErrorConstructor = abstract new (message: string, payload?: Record<string, unknown>) => Error;

const errorHttpStatusByDomainError: Map<ErrorConstructor, HttpStatus> = new Map([
	[ValidationDomainError, HttpStatus.BAD_REQUEST],
	[InvalidTransitionDomainError, HttpStatus.CONFLICT],
]);

const errorHttpStatusByApplicationError: Map<ErrorConstructor, HttpStatus> = new Map([
	[RessourceNotFoundApplicationError, HttpStatus.NOT_FOUND],
	[RessourceAlreadyExistsApplicationError, HttpStatus.CONFLICT],
]);

const errorHttpStatusByInfrastructureError: Map<ErrorConstructor, HttpStatus> = new Map([[ValidationInfrastructureError, HttpStatus.INTERNAL_SERVER_ERROR]]);

const errorHttpStatusByPresentationError: Map<ErrorConstructor, HttpStatus> = new Map([
	[DtoValidationPresentationError, HttpStatus.BAD_REQUEST],
	[UnauthorizedPresentationError, HttpStatus.UNAUTHORIZED],
]);

export const errorHttpStatusByError: Map<ErrorConstructor, HttpStatus> = new Map([
	...errorHttpStatusByDomainError.entries(),
	...errorHttpStatusByApplicationError.entries(),
	...errorHttpStatusByInfrastructureError.entries(),
	...errorHttpStatusByPresentationError.entries(),
]);
