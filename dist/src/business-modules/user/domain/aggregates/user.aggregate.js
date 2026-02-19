"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const auth0Id_vo_1 = require("../value-objects/auth0Id.vo");
const email_vo_1 = require("../../../../libs/value-objects/email.vo");
const uuid_vo_1 = require("../../../../libs/value-objects/uuid.vo");
class User {
    _id;
    _email;
    _auth0Id;
    _firstName;
    _lastName;
    constructor(props) {
        this._id = props.id;
        this._email = props.email;
        this._auth0Id = props.auth0Id;
        this._firstName = props.firstName;
        this._lastName = props.lastName;
    }
    static create(props) {
        return new User({
            id: uuid_vo_1.Uuid.generate(),
            email: props.email ? email_vo_1.Email.create(props.email) : null,
            auth0Id: auth0Id_vo_1.Auth0Id.create(props.auth0Id),
            firstName: props.firstName,
            lastName: props.lastName,
        });
    }
    static fromPrimitives(primitives) {
        return new User({
            id: uuid_vo_1.Uuid.create(primitives.id),
            email: primitives.email ? email_vo_1.Email.create(primitives.email) : null,
            auth0Id: auth0Id_vo_1.Auth0Id.create(primitives.auth0Id),
            firstName: primitives.firstName,
            lastName: primitives.lastName,
        });
    }
    get id() {
        return this._id;
    }
    get auth0Id() {
        return this._auth0Id;
    }
    updateName(firstName, lastName) {
        this._firstName = firstName;
        this._lastName = lastName;
    }
    get fullName() {
        if (!this._firstName && !this._lastName)
            return null;
        return [this._firstName, this._lastName].filter(Boolean).join(" ");
    }
    toPrimitives() {
        return {
            id: this._id.toString(),
            email: this._email?.toString() ?? null,
            auth0Id: this._auth0Id.toString(),
            firstName: this._firstName,
            lastName: this._lastName,
        };
    }
}
exports.User = User;
//# sourceMappingURL=user.aggregate.js.map