"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serialize = exports.RESPONSE_TYPE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.RESPONSE_TYPE_KEY = "response_type";
const Serialize = (dto) => {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(exports.RESPONSE_TYPE_KEY, dto), (0, common_1.SetMetadata)("response_dto_name", dto.name));
};
exports.Serialize = Serialize;
//# sourceMappingURL=serialize.decorator.js.map