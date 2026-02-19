"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPrismaRepository = void 0;
const user_aggregate_1 = require("../../domain/aggregates/user.aggregate");
class UserPrismaRepository {
    _prisma;
    constructor(_prisma) {
        this._prisma = _prisma;
    }
    async getByAuth0Id(auth0Id) {
        const user = await this._prisma.user.findUnique({
            where: {
                auth0Id: auth0Id.toString(),
            },
        });
        if (!user) {
            return null;
        }
        return user_aggregate_1.User.fromPrimitives(user);
    }
    async create(user) {
        const primitives = user.toPrimitives();
        await this._prisma.user.create({
            data: {
                email: primitives.email,
                auth0Id: primitives.auth0Id,
                firstName: primitives.firstName,
                id: primitives.id,
                lastName: primitives.lastName,
            },
        });
    }
}
exports.UserPrismaRepository = UserPrismaRepository;
//# sourceMappingURL=user.prisma-repository.js.map