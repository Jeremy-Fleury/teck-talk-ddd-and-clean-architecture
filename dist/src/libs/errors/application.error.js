"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RessourceNotFoundApplicationError = exports.RessourceAlreadyExistsApplicationError = exports.ApplicationError = void 0;
class ApplicationError extends Error {
    payload;
    constructor(message, payload = {}) {
        super(message);
        this.name = this.constructor.name;
        this.payload = payload;
    }
}
exports.ApplicationError = ApplicationError;
class RessourceAlreadyExistsApplicationError extends ApplicationError {
}
exports.RessourceAlreadyExistsApplicationError = RessourceAlreadyExistsApplicationError;
class RessourceNotFoundApplicationError extends ApplicationError {
}
exports.RessourceNotFoundApplicationError = RessourceNotFoundApplicationError;
//# sourceMappingURL=application.error.js.map