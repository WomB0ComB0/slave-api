"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    constructor(msg, statusCode, name = 'ApiError') {
        super();
        this.status = 500;
        this.success = false;
        this.message = msg;
        this.status = statusCode;
        this.name = name;
    }
}
exports.default = ApiError;
//# sourceMappingURL=ApiError.js.map