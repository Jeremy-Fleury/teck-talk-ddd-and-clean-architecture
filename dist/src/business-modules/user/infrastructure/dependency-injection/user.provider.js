"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_OR_CREATE_USER_USE_CASE_PROVIDER = void 0;
const database_token_1 = require("../../../../modules-root/database/infrastructure/dependency-injection/database.token");
const get_or_create_user_use_case_1 = require("../../application/get-or-create-user.use-case");
const user_token_1 = require("./user.token");
exports.GET_OR_CREATE_USER_USE_CASE_PROVIDER = {
	inject: [database_token_1.PRISMA_UNIT_OF_WORK_TOKEN],
	provide: user_token_1.GET_OR_CREATE_USER_USE_CASE_TOKEN,
	useFactory: (unitOfWork) => {
		return new get_or_create_user_use_case_1.GetOrCreateUserUseCase(unitOfWork);
	},
};
//# sourceMappingURL=user.provider.js.map
