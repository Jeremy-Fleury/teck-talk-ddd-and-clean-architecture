"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const errors_mapper_1 = require("../mappers/errors.mapper");
const application_error_1 = require("../../../../libs/errors/application.error");
const domain_error_1 = require("../../../../libs/errors/domain.error");
const infrastructure_error_1 = require("../../../../libs/errors/infrastructure.error");
const presentation_error_1 = require("../../../../libs/errors/presentation.error");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    _logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const { status, body } = this._mapExceptionToHttpResponse(exception);
        response.status(status).send(body);
    }
    _mapExceptionToHttpResponse(exception) {
        if (exception instanceof domain_error_1.DomainError ||
            exception instanceof application_error_1.ApplicationError ||
            exception instanceof infrastructure_error_1.InfrastructureError ||
            exception instanceof presentation_error_1.PresentationError) {
            const status = this._getStatusForError(exception) ?? common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const response = this._buildResponse(status, exception.message, exception.payload);
            this._logger.error(response);
            return response;
        }
        const response = this._buildResponse(common_1.HttpStatus.INTERNAL_SERVER_ERROR, "This error is not handled by the application", {});
        this._logger.error(response, exception);
        return response;
    }
    _getStatusForError(error) {
        for (const [errorType, status] of errors_mapper_1.errorHttpStatusByError.entries()) {
            if (error instanceof errorType) {
                return status;
            }
        }
        return null;
    }
    _buildResponse(status, message, payload) {
        return {
            body: {
                message,
                payload,
            },
            status,
        };
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map