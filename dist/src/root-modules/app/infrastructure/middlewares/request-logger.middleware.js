"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RequestLoggerMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
let RequestLoggerMiddleware = RequestLoggerMiddleware_1 = class RequestLoggerMiddleware {
    _logger = new common_1.Logger(RequestLoggerMiddleware_1.name);
    use(req, _res, next) {
        req.host;
        this._logger.debug([
            "\n▶ Incoming request",
            req.host ? `  - host: ${req.host}` : undefined,
            req.method ? `  - method: ${req.method}` : undefined,
            req.hostname ? `  - hostname: ${req.hostname}` : undefined,
            req.originalUrl ? `  - originalUrl: ${req.originalUrl}` : undefined,
            req.query ? `  - query: ${this._safeStringify(req.query)}` : undefined,
            req.params ? `  - params: ${this._safeStringify(req.params)}` : undefined,
            req.body ? `  - body: ${this._safeStringify(req.body)}` : undefined,
        ]
            .filter(Boolean)
            .join("\n"));
        next();
    }
    _safeStringify(value) {
        if (value === undefined) {
            return "undefined";
        }
        if (typeof value === "string") {
            return value;
        }
        try {
            return JSON.stringify(value);
        }
        catch {
            return "[unserializable]";
        }
    }
};
exports.RequestLoggerMiddleware = RequestLoggerMiddleware;
exports.RequestLoggerMiddleware = RequestLoggerMiddleware = RequestLoggerMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], RequestLoggerMiddleware);
//# sourceMappingURL=request-logger.middleware.js.map