"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrCreateUserUseCase = void 0;
const user_aggregate_1 = require("../domain/aggregates/user.aggregate");
const auth0Id_vo_1 = require("../domain/value-objects/auth0Id.vo");
class GetOrCreateUserUseCase {
    _unitOfWork;
    constructor(_unitOfWork) {
        this._unitOfWork = _unitOfWork;
    }
    async execute(auth0Id) {
        return await this._unitOfWork.execute(async (context) => {
            let user = null;
            user = await context.user.getByAuth0Id(auth0Id_vo_1.Auth0Id.create(auth0Id));
            if (user !== null) {
                return user;
            }
            user = user_aggregate_1.User.create({
                email: null,
                auth0Id: auth0Id,
                firstName: null,
                lastName: null,
            });
            await context.user.create(user);
            return user;
        });
    }
}
exports.GetOrCreateUserUseCase = GetOrCreateUserUseCase;
//# sourceMappingURL=get-or-create-user.use-case.js.map