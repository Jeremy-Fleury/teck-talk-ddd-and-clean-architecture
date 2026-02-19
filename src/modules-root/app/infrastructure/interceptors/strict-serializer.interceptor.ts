import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { map as MapRxJs } from 'rxjs/operators';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { ClassTransformOptions } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import type { Observable } from 'rxjs';

import { RESPONSE_TYPE_KEY } from '@/modules-root/app/infrastructure/decorators/serialize.decorator';

import { DtoValidationPresentationError } from '@/libs/errors/presentation.error';

type ClassType<T = unknown> = new (...args: unknown[]) => T;

const CLASS_TRANSFORM_OPTIONS: ClassTransformOptions = {
	enableImplicitConversion: true,
	excludeExtraneousValues: true,
	exposeUnsetFields: false,
	strategy: 'excludeAll',
};

@Injectable()
export class StrictSerializerInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		return next.handle().pipe(
			MapRxJs((data) => {
				const responseType = this._getResponseType(context);
				const transformed = this._transformRecursive(data, responseType, new WeakSet());

				this._validateRecursive(transformed, context, new WeakSet());

				return transformed;
			}),
		);
	}

	private _getResponseType(context: ExecutionContext): ClassType {
		const responseType = Reflect.getMetadata(RESPONSE_TYPE_KEY, context.getHandler());

		if (!responseType) {
			const { controllerName, methodName } = this._getHandlerInfo(context);

			throw new DtoValidationPresentationError(`Controller ${controllerName}.${methodName}() must use @Serialize decorator`);
		}

		return responseType;
	}

	private _transformRecursive(data: unknown, responseType: ClassType, seen: WeakSet<object>): unknown {
		if (data === null || data === undefined) {
			return data;
		}

		if (Array.isArray(data)) {
			return data.map((item) => this._transformRecursive(item, responseType, seen));
		}

		if (typeof data !== 'object') {
			return data;
		}

		if (seen.has(data)) {
			return;
		}

		seen.add(data);

		return plainToInstance(responseType, data, CLASS_TRANSFORM_OPTIONS);
	}

	private _validateRecursive(data: unknown, context: ExecutionContext, seen: WeakSet<object>): void {
		if (data === null || data === undefined) {
			return;
		}

		if (Array.isArray(data)) {
			for (const item of data) {
				this._validateRecursive(item, context, seen);
			}

			return;
		}

		if (typeof data !== 'object') {
			return;
		}

		if (seen.has(data)) {
			return;
		}

		seen.add(data);

		this._validateSingleItem(data, context);
	}

	private _validateSingleItem(item: object, context: ExecutionContext): void {
		const errors: ValidationError[] = validateSync(item, {
			skipMissingProperties: false,
			whitelist: true,
		});

		if (errors.length > 0) {
			const { controllerName, methodName } = this._getHandlerInfo(context);
			const errorMessages = this._formatValidationErrors(errors);

			throw new DtoValidationPresentationError(`Output validation failed in ${controllerName}.${methodName}(): ${errorMessages}`);
		}
	}

	private _getHandlerInfo(context: ExecutionContext): {
		controllerName: string;
		methodName: string;
	} {
		return {
			controllerName: context.getClass().name,
			methodName: context.getHandler().name,
		};
	}

	private _formatValidationErrors(errors: ValidationError[]): string {
		return errors
			.map((err) => {
				const constraints = Object.values(err.constraints || {});

				return `${err.property}: ${constraints.join(', ')}`;
			})
			.join('; ');
	}
}
