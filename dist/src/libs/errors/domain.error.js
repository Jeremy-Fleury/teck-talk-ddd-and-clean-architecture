"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationDomainError = exports.InvalidTransitionDomainError = exports.DomainError = void 0;
class DomainError extends Error {
    payload;
    constructor(message, payload = {}) {
        super(message);
        this.name = this.constructor.name;
        this.payload = payload;
    }
}
exports.DomainError = DomainError;
class InvalidTransitionDomainError extends DomainError {
}
exports.InvalidTransitionDomainError = InvalidTransitionDomainError;
class ValidationDomainError extends DomainError {
}
exports.ValidationDomainError = ValidationDomainError;
//# sourceMappingURL=domain.error.js.map