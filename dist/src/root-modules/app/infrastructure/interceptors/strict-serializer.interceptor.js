"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StrictSerializerInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrictSerializerInterceptor = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const operators_1 = require("rxjs/operators");
const serialize_decorator_1 = require("../decorators/serialize.decorator");
const presentation_error_1 = require("../../../../libs/errors/presentation.error");
let StrictSerializerInterceptor = class StrictSerializerInterceptor {
    static { StrictSerializerInterceptor_1 = this; }
    static _CLASS_TRANSFORM_OPTIONS = {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
        strategy: "excludeAll",
    };
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => {
            const responseType = this._getResponseType(context);
            const transformed = this._transformRecursive(data, responseType, new WeakSet());
            this._validateRecursive(transformed, context, new WeakSet());
            return transformed;
        }));
    }
    _getResponseType(context) {
        const responseType = Reflect.getMetadata(serialize_decorator_1.RESPONSE_TYPE_KEY, context.getHandler());
        if (!responseType) {
            const { controllerName, methodName } = this._getHandlerInfo(context);
            throw new presentation_error_1.DtoValidationPresentationError(`Controller ${controllerName}.${methodName}() must use @Serialize decorator`);
        }
        return responseType;
    }
    _transformRecursive(data, responseType, seen) {
        if (data === null || data === undefined) {
            return data;
        }
        if (Array.isArray(data)) {
            return data.map((item) => this._transformRecursive(item, responseType, seen));
        }
        if (typeof data !== "object") {
            return data;
        }
        if (seen.has(data)) {
            return;
        }
        seen.add(data);
        return (0, class_transformer_1.plainToInstance)(responseType, data, StrictSerializerInterceptor_1._CLASS_TRANSFORM_OPTIONS);
    }
    _validateRecursive(data, context, seen) {
        if (data === null || data === undefined) {
            return;
        }
        if (Array.isArray(data)) {
            for (const item of data) {
                this._validateRecursive(item, context, seen);
            }
            return;
        }
        if (typeof data !== "object") {
            return;
        }
        if (seen.has(data)) {
            return;
        }
        seen.add(data);
        this._validateSingleItem(data, context);
    }
    _validateSingleItem(item, context) {
        const errors = (0, class_validator_1.validateSync)(item, {
            skipMissingProperties: false,
            whitelist: true,
        });
        if (errors.length > 0) {
            const { controllerName, methodName } = this._getHandlerInfo(context);
            const errorMessages = this._formatValidationErrors(errors);
            throw new presentation_error_1.DtoValidationPresentationError(`Output validation failed in ${controllerName}.${methodName}(): ${errorMessages}`);
        }
    }
    _getHandlerInfo(context) {
        return {
            controllerName: context.getClass().name,
            methodName: context.getHandler().name,
        };
    }
    _formatValidationErrors(errors) {
        return errors
            .map((err) => {
            const constraints = Object.values(err.constraints || {});
            return `${err.property}: ${constraints.join(", ")}`;
        })
            .join("; ");
    }
};
exports.StrictSerializerInterceptor = StrictSerializerInterceptor;
exports.StrictSerializerInterceptor = StrictSerializerInterceptor = StrictSerializerInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], StrictSerializerInterceptor);
//# sourceMappingURL=strict-serializer.interceptor.js.map