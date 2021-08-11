"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvalidUserInputError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidUserInputError';
        Error.captureStackTrace(this, InvalidUserInputError);
    }
}
exports.InvalidUserInputError = InvalidUserInputError;
//# sourceMappingURL=invalid-user-input-error.js.map