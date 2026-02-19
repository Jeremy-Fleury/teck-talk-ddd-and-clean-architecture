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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const request_logger_middleware_1 = require("../../infrastructure/middlewares/request-logger.middleware");
const app_controller_1 = require("../controllers/app.controller");
const database_module_1 = require("../../../database/presentation/modules/database.module");
const env_module_1 = require("../../../env/presentation/modules/env.module");
const user_module_1 = require("../../../../modules-business/user/presentation/modules/user.module");
const forRootImports = [env_module_1.EnvModule.forRoot(), database_module_1.DatabaseModule.forRoot()];
const staticImports = [user_module_1.UserModule];
let AppModule = class AppModule {
	configure(consumer) {
		consumer.apply(request_logger_middleware_1.RequestLoggerMiddleware).forRoutes("*");
	}
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate(
	[
		(0, common_1.Module)({
			controllers: [app_controller_1.AppController],
			imports: [...forRootImports, ...staticImports],
		}),
	],
	AppModule,
);
//# sourceMappingURL=app.module.js.map
