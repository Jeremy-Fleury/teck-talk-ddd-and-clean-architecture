"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationService = envValidationService;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const env_input_dto_1 = require("../../presentation/dto/inputs/env.input-dto");
function envValidationService(config) {
    if (config["NODE_ENV"] === "openapi") {
        return config;
    }
    const validatedConfig = (0, class_transformer_1.plainToInstance)(env_input_dto_1.EnvironmentVariablesInputDto, config, {
        enableImplicitConversion: true,
    });
    const errors = (0, class_validator_1.validateSync)(validatedConfig, {
        skipMissingProperties: false,
    });
    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}
//# sourceMappingURL=env.service.js.map