"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigTreeError = void 0;
class BigTreeError extends Error {
    constructor(...args) {
        super(...args);
        this.code = 422;
        this.name = 'BigTreeError';
        Error.captureStackTrace(this, BigTreeError);
    }
}
exports.BigTreeError = BigTreeError;
//# sourceMappingURL=big-tree-error.js.map