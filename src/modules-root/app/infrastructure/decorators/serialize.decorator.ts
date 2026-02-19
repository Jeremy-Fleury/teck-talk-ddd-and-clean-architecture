/** biome-ignore-all lint/style/useNamingConvention: Bypass naming convention for decorator */

import { applyDecorators, SetMetadata } from '@nestjs/common';

export const RESPONSE_TYPE_KEY = 'response_type';

type ClassType<T = unknown> = new (...args: unknown[]) => T;

/**
 * Decorator to specify the serialization DTO
 * Uses TypeScript metadata to validate consistency
 */
export const Serialize = <Dto>(dto: ClassType<Dto>) => {
	return applyDecorators(SetMetadata(RESPONSE_TYPE_KEY, dto), SetMetadata('response_dto_name', dto.name));
};
