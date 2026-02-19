"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedPresentationError = exports.DtoValidationPresentationError = exports.PresentationError = void 0;
class PresentationError extends Error {
    payload;
    constructor(message, payload = {}) {
        super(message);
        this.name = this.constructor.name;
        this.payload = payload;
    }
}
exports.PresentationError = PresentationError;
class DtoValidationPresentationError extends PresentationError {
}
exports.DtoValidationPresentationError = DtoValidationPresentationError;
class UnauthorizedPresentationError extends PresentationError {
}
exports.UnauthorizedPresentationError = UnauthorizedPresentationError;
//# sourceMappingURL=presentation.error.js.map