"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidManifestError = void 0;
class InvalidManifestError extends Error {
    constructor(...args) {
        super(...args);
        this.code = 422;
        this.name = 'InvalidManifestError';
        Error.captureStackTrace(this, InvalidManifestError);
    }
}
exports.InvalidManifestError = InvalidManifestError;
//# sourceMappingURL=invalid-manifest-error.js.map