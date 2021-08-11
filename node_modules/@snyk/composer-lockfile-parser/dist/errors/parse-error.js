"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ParseError';
        Error.captureStackTrace(this, ParseError);
    }
}
exports.ParseError = ParseError;
//# sourceMappingURL=parse-error.js.map