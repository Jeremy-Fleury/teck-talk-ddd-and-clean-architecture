"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHttpStatusByError = void 0;
const common_1 = require("@nestjs/common");
const application_error_1 = require("../../../../libs/errors/application.error");
const domain_error_1 = require("../../../../libs/errors/domain.error");
const infrastructure_error_1 = require("../../../../libs/errors/infrastructure.error");
const presentation_error_1 = require("../../../../libs/errors/presentation.error");
const errorHttpStatusByDomainError = new Map([
    [domain_error_1.ValidationDomainError, common_1.HttpStatus.BAD_REQUEST],
    [domain_error_1.InvalidTransitionDomainError, common_1.HttpStatus.CONFLICT],
]);
const errorHttpStatusByApplicationError = new Map([
    [application_error_1.RessourceNotFoundApplicationError, common_1.HttpStatus.NOT_FOUND],
    [application_error_1.RessourceAlreadyExistsApplicationError, common_1.HttpStatus.CONFLICT],
]);
const errorHttpStatusByInfrastructureError = new Map([
    [infrastructure_error_1.ValidationInfrastructureError, common_1.HttpStatus.INTERNAL_SERVER_ERROR],
]);
const errorHttpStatusByPresentationError = new Map([
    [presentation_error_1.DtoValidationPresentationError, common_1.HttpStatus.BAD_REQUEST],
    [presentation_error_1.UnauthorizedPresentationError, common_1.HttpStatus.UNAUTHORIZED],
]);
exports.errorHttpStatusByError = new Map([
    ...errorHttpStatusByDomainError.entries(),
    ...errorHttpStatusByApplicationError.entries(),
    ...errorHttpStatusByInfrastructureError.entries(),
    ...errorHttpStatusByPresentationError.entries(),
]);
//# sourceMappingURL=errors.mapper.js.map