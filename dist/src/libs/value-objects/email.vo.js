"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const validator_1 = require("validator");
const domain_error_1 = require("../errors/domain.error");
class Email {
    _value;
    static _MAX_LENGTH = 254;
    constructor(value) {
        const cleaned = this._clean(value);
        this._validate(cleaned);
        this._value = cleaned;
    }
    static create(value) {
        return new Email(value);
    }
    equals(other) {
        return this._value === other._value;
    }
    toString() {
        return this._value;
    }
    _clean(value) {
        return value.trim().toLowerCase();
    }
    _validate(value) {
        if (value.length === 0) {
            throw new domain_error_1.ValidationDomainError("Email cannot be empty.", { value });
        }
        if (value.length > Email._MAX_LENGTH) {
            throw new domain_error_1.ValidationDomainError(`Email exceeds maximum length of ${Email._MAX_LENGTH} characters.`, {
                value,
            });
        }
        if (!(0, validator_1.isEmail)(value)) {
            throw new domain_error_1.ValidationDomainError("Email format is invalid.", { value });
        }
    }
}
exports.Email = Email;
//# sourceMappingURL=email.vo.js.map