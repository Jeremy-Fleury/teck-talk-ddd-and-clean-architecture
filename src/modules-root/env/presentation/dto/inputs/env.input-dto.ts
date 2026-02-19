/** biome-ignore-all lint/style/useNamingConvention: Biome is not able to detect the correct naming convention for this file */

import { IsIn, IsNumber, IsString, Max, Min } from 'class-validator';

const MIN_PORT = 0;
const MAX_PORT = 65535;

export class EnvironmentVariablesInputDto {
	@IsString()
	@IsIn(['local', 'development', 'production', 'test', 'openapi'])
	NODE_ENV!: 'local' | 'development' | 'production' | 'test' | 'openapi';

	@IsNumber()
	@Min(MIN_PORT)
	@Max(MAX_PORT)
	PORT!: number;
}
