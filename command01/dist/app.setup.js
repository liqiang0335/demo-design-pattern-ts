"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureApp = configureApp;
const common_1 = require("@nestjs/common");
const business_exception_filter_1 = require("./interfaces/business-exception.filter");
function configureApp(app) {
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        validateCustomDecorators: true,
    }));
    app.useGlobalFilters(new business_exception_filter_1.BusinessExceptionFilter());
}
//# sourceMappingURL=app.setup.js.map