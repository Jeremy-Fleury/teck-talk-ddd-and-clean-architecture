"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uuid = void 0;
const uuid_1 = require("uuid");
const domain_error_1 = require("../errors/domain.error");
class Uuid {
    static _VERSION = 7;
    _value;
    constructor(value) {
        this._validate(value);
        this._value = value;
    }
    static create(value) {
        return new Uuid(value);
    }
    static generate() {
        const uuid = (0, uuid_1.v7)();
        return new Uuid(uuid);
    }
    equals(other) {
        return this._value === other._value;
    }
    toString() {
        return this._value;
    }
    _validate(value) {
        if (!(0, uuid_1.validate)(value)) {
            throw new domain_error_1.ValidationDomainError(`Invalid UUID ${Uuid._VERSION} format`);
        }
        if ((0, uuid_1.version)(value) !== Uuid._VERSION) {
            throw new domain_error_1.ValidationDomainError(`Invalid UUID ${Uuid._VERSION} format`);
        }
        return true;
    }
}
exports.Uuid = Uuid;
//# sourceMappingURL=uuid.vo.js.map