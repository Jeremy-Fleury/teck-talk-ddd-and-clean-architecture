"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth0Id = void 0;
const domain_error_1 = require("../../../../libs/errors/domain.error");
class Auth0Id {
    static _PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]+\|[a-zA-Z0-9._-]+$/;
    _provider;
    _identifier;
    constructor(value) {
        const cleaned = this._clean(value);
        this._validate(cleaned);
        const { provider, identifier } = this._parse(cleaned);
        this._provider = provider;
        this._identifier = identifier;
    }
    static create(value) {
        return new Auth0Id(value);
    }
    get provider() {
        return this._provider;
    }
    get identifier() {
        return this._identifier;
    }
    equals(other) {
        return this._provider === other._provider && this._identifier === other._identifier;
    }
    toString() {
        return `${this._provider}|${this._identifier}`;
    }
    _parse(value) {
        const separatorIndex = value.indexOf("|");
        return {
            provider: value.substring(0, separatorIndex),
            identifier: value.substring(separatorIndex + 1),
        };
    }
    _clean(value) {
        return value.trim();
    }
    _validate(value) {
        if (value.length === 0) {
            throw new domain_error_1.ValidationDomainError("Auth0 ID cannot be empty.", { value });
        }
        if (!Auth0Id._PATTERN.test(value)) {
            throw new domain_error_1.ValidationDomainError('Auth0 ID must follow the "provider|identifier" format.', { value });
        }
    }
}
exports.Auth0Id = Auth0Id;
//# sourceMappingURL=auth0Id.vo.js.map