"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const serialize_decorator_1 = require("../../infrastructure/decorators/serialize.decorator");
const health_output_dto_1 = require("../dto/outputs/health.output-dto");
const public_decorator_1 = require("../../../../libs/decorators/public.decorator");
let AppController = class AppController {
    health() {
        return { secret: "tata", status: "ok" };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)("/"),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: "Health check",
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Liveness response: `status="ok"`.',
        type: health_output_dto_1.HealthOutputDto,
    }),
    (0, serialize_decorator_1.Serialize)(health_output_dto_1.HealthOutputDto),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", health_output_dto_1.HealthOutputDto)
], AppController.prototype, "health", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map