import type { EnvironmentVariablesInputDto } from "@/modules-root/env/presentation/dto/inputs/env.input-dto";
export declare function envValidationService(
	config: Record<string, unknown>,
): EnvironmentVariablesInputDto | Record<string, unknown>;
