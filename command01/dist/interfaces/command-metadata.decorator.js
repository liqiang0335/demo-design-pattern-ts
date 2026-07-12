"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandMetadata = void 0;
const common_1 = require("@nestjs/common");
exports.CommandMetadata = (0, common_1.createParamDecorator)((_data, context) => {
    const request = context.switchToHttp().getRequest();
    return {
        commandId: getSingleHeaderValue(request.headers['x-command-id']),
        operatorId: getSingleHeaderValue(request.headers['x-operator-id']),
    };
});
function getSingleHeaderValue(value) {
    return Array.isArray(value) ? undefined : value;
}
//# sourceMappingURL=command-metadata.decorator.js.map