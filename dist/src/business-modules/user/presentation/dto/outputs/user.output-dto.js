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
exports.UserOutputDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class UserOutputDto {
    id;
    email;
    firstName;
    lastName;
}
exports.UserOutputDto = UserOutputDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "The user id",
        example: "019ad951-368a-7de5-b7ba-add19cfd187b",
        type: String,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserOutputDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "The user email",
        example: "hello@acme.com",
        nullable: true,
        type: String,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserOutputDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "First name for the user",
        example: "John",
        nullable: true,
        type: String,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserOutputDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Last name for the user",
        example: "Doe",
        nullable: true,
        type: String,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserOutputDto.prototype, "lastName", void 0);
//# sourceMappingURL=user.output-dto.js.map