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
var __metadata =
	(this && this.__metadata) ||
	function (k, v) {
		if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
var __param =
	(this && this.__param) ||
	function (paramIndex, decorator) {
		return function (target, key) {
			decorator(target, key, paramIndex);
		};
	};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const serialize_decorator_1 = require("../../../../modules-root/app/infrastructure/decorators/serialize.decorator");
const user_output_dto_1 = require("../dto/outputs/user.output-dto");
const current_user_decorator_1 = require("../../../../libs/decorators/current-user.decorator");
let UserController = class UserController {
	user(currentUser) {
		return currentUser.toPrimitives();
	}
};
exports.UserController = UserController;
__decorate(
	[
		(0, common_1.Get)(),
		(0, common_1.HttpCode)(common_1.HttpStatus.OK),
		(0, swagger_1.ApiOkResponse)({
			description: "Current user found and returned.",
			type: user_output_dto_1.UserOutputDto,
		}),
		(0, serialize_decorator_1.Serialize)(user_output_dto_1.UserOutputDto),
		__param(0, (0, current_user_decorator_1.CurrentUser)()),
		__metadata("design:type", Function),
		__metadata("design:paramtypes", [Function]),
		__metadata("design:returntype", user_output_dto_1.UserOutputDto),
	],
	UserController.prototype,
	"user",
	null,
);
exports.UserController = UserController = __decorate(
	[(0, common_1.Controller)("user"), (0, swagger_1.ApiBearerAuth)()],
	UserController,
);
//# sourceMappingURL=user.controller.js.map
