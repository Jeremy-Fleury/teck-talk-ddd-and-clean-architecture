"use strict";
var __decorate =
	(this && this.__decorate) ||
	function (decorators, target, key, desc) {
		var c = arguments.length,
			r = c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc,
			d;
		if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
			r = Reflect.decorate(decorators, target, key, desc);
		else
			for (var i = decorators.length - 1; i >= 0; i--)
				if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
		return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_strategy_1 = require("../../../../modules-root/app/infrastructure/strategies/jwt.strategy");
const user_provider_1 = require("../../infrastructure/dependency-injection/user.provider");
const user_controller_1 = require("../controllers/user.controller");
let UserModule = class UserModule {};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate(
	[
		(0, common_1.Module)({
			controllers: [user_controller_1.UserController],
			exports: [],
			imports: [passport_1.PassportModule.register({ defaultStrategy: "jwt" })],
			providers: [jwt_strategy_1.JwtStrategy, user_provider_1.GET_OR_CREATE_USER_USE_CASE_PROVIDER],
		}),
	],
	UserModule,
);
//# sourceMappingURL=user.module.js.map
