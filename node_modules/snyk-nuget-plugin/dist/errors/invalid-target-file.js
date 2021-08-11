"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTargetFile = void 0;
class InvalidTargetFile extends Error {
    constructor(...args) {
        super(...args);
        this.code = 422;
        this.name = 'InvalidTargetFile';
        Error.captureStackTrace(this, InvalidTargetFile);
    }
}
exports.InvalidTargetFile = InvalidTargetFile;
//# sourceMappingURL=invalid-target-file.js.map