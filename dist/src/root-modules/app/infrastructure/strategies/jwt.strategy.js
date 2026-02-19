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
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const passport_jwt_1 = require("passport-jwt");
const user_token_1 = require("../../../../modules-business/user/infrastructure/dependency-injection/user.token");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
	_getOrCreateUserUseCase;
	constructor(configService, _getOrCreateUserUseCase) {
		const NODE_ENV = configService.get("NODE_ENV");
		if (NODE_ENV === "openapi") {
			super({
				algorithms: ["RS256"],
				audience: "openapi",
				issuer: "https://fake-issuer-url.com/",
				jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
				passReqToCallback: true,
				secretOrKeyProvider: jwks_rsa_1.default.passportJwtSecret({
					cache: true,
					jwksRequestsPerMinute: 5,
					jwksUri: "https://fake-jwks-uri.com/.well-known/jwks.json",
					rateLimit: true,
				}),
			});
			return;
		}
		const ISSUER_URL = configService.get("AUTH0_ISSUER_URL") ?? "https://fake-issuer-url.com/";
		const AUDIENCE = configService.get("AUTH0_AUDIENCE") ?? "openapi";
		if (!ISSUER_URL || !AUDIENCE) {
			throw new Error("AUTH0_ISSUER_URL and AUTH0_AUDIENCE must be configured.");
		}
		const normalizedIssuer = ISSUER_URL.endsWith("/") ? ISSUER_URL : `${ISSUER_URL}/`;
		super({
			algorithms: ["RS256"],
			audience: AUDIENCE,
			issuer: normalizedIssuer,
			jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
			passReqToCallback: true,
			secretOrKeyProvider: jwks_rsa_1.default.passportJwtSecret({
				cache: true,
				jwksRequestsPerMinute: 5,
				jwksUri: `${normalizedIssuer}.well-known/jwks.json`,
				rateLimit: true,
			}),
		});
		this._getOrCreateUserUseCase = _getOrCreateUserUseCase;
	}
	async validate(_request, payload) {
		const externalId = payload.sub;
		const user = await this._getOrCreateUserUseCase.execute(externalId);
		if (!user) {
			throw new common_1.InternalServerErrorException("An error occurred while fetching the user");
		}
		return user;
	}
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate(
	[
		__param(0, (0, common_1.Inject)(config_1.ConfigService)),
		__param(1, (0, common_1.Inject)(user_token_1.GET_OR_CREATE_USER_USE_CASE_TOKEN)),
		__metadata("design:paramtypes", [config_1.ConfigService, Function]),
	],
	JwtStrategy,
);
//# sourceMappingURL=jwt.strategy.js.map
