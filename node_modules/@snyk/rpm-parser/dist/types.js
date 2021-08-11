"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParserError extends Error {
    constructor(message, context) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.context = context;
    }
}
exports.ParserError = ParserError;
//# sourceMappingURL=types.js.map