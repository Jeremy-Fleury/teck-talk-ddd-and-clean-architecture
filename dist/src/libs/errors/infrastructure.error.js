"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiredFieldInfrastructureError = exports.ValidationInfrastructureError = exports.InfrastructureError = void 0;
class InfrastructureError extends Error {
    payload;
    constructor(message, payload = {}) {
        super(message);
        this.name = this.constructor.name;
        this.payload = payload;
    }
}
exports.InfrastructureError = InfrastructureError;
class ValidationInfrastructureError extends InfrastructureError {
}
exports.ValidationInfrastructureError = ValidationInfrastructureError;
class RequiredFieldInfrastructureError extends InfrastructureError {
}
exports.RequiredFieldInfrastructureError = RequiredFieldInfrastructureError;
//# sourceMappingURL=infrastructure.error.js.map