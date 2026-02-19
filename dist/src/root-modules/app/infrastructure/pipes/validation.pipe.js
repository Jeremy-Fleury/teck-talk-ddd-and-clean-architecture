"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationPipe = createValidationPipe;
const common_1 = require("@nestjs/common");
const presentation_error_1 = require("../../../../libs/errors/presentation.error");
function createValidationPipe() {
    return new common_1.ValidationPipe({
        exceptionFactory: (errors) => {
            return new presentation_error_1.DtoValidationPresentationError("DTO validation failed", {
                details: errors,
            });
        },
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transform: true,
        whitelist: true,
    });
}
//# sourceMappingURL=validation.pipe.js.map