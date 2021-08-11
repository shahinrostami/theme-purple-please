"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileNotFoundError = void 0;
class FileNotFoundError extends Error {
    constructor(...args) {
        super(...args);
        this.code = 422;
        this.name = 'FileNotFoundError';
        Error.captureStackTrace(this, FileNotFoundError);
    }
}
exports.FileNotFoundError = FileNotFoundError;
//# sourceMappingURL=file-not-found-error.js.map