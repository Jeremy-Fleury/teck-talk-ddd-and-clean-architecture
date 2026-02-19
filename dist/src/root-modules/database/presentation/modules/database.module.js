"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const database_provider_1 = require("../../infrastructure/dependency-injection/database.provider");
const database_token_1 = require("../../infrastructure/dependency-injection/database.token");
const DATABASE_MODULE_GUARD = Symbol("DATABASE_MODULE_GUARD");
let DatabaseModule = class DatabaseModule {
    static { DatabaseModule_1 = this; }
    static _isRegistered = false;
    static forRoot() {
        if (DatabaseModule_1._isRegistered) {
            throw new Error("DatabaseModule already registered");
        }
        DatabaseModule_1._isRegistered = true;
        return {
            exports: [database_token_1.PRISMA_SERVICE_TOKEN, database_token_1.PRISMA_UNIT_OF_WORK_TOKEN],
            global: true,
            imports: [],
            module: DatabaseModule_1,
            providers: [
                { provide: DATABASE_MODULE_GUARD, useValue: true },
                database_provider_1.PRISMA_SERVICE_PROVIDER,
                database_provider_1.PRISMA_UNIT_OF_WORK_PROVIDER,
            ],
        };
    }
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = DatabaseModule_1 = __decorate([
    (0, common_1.Module)({})
], DatabaseModule);
//# sourceMappingURL=database.module.js.map