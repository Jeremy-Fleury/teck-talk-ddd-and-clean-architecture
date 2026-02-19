"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitOfWorkPrismaService = void 0;
const user_prisma_repository_1 = require("../../../../modules-business/user/infrastructure/repositories/user.prisma-repository");
class UnitOfWorkPrismaService {
	_prismaService;
	constructor(_prismaService) {
		this._prismaService = _prismaService;
	}
	execute(callback) {
		return this._prismaService.$transaction((tx) => {
			const user = new user_prisma_repository_1.UserPrismaRepository(tx);
			const context = {
				user,
			};
			return callback(context);
		});
	}
}
exports.UnitOfWorkPrismaService = UnitOfWorkPrismaService;
//# sourceMappingURL=prisma-unit-of-work.service.js.map
