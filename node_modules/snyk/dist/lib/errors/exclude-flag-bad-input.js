"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcludeFlagBadInputError = void 0;
const custom_error_1 = require("./custom-error");
class ExcludeFlagBadInputError extends custom_error_1.CustomError {
    constructor() {
        super(ExcludeFlagBadInputError.ERROR_MESSAGE);
        this.code = ExcludeFlagBadInputError.ERROR_CODE;
        this.userMessage = ExcludeFlagBadInputError.ERROR_MESSAGE;
    }
}
exports.ExcludeFlagBadInputError = ExcludeFlagBadInputError;
ExcludeFlagBadInputError.ERROR_CODE = 422;
ExcludeFlagBadInputError.ERROR_MESSAGE = 'Empty --exclude argument. Did you mean --exclude=subdirectory ?';
//# sourceMappingURL=exclude-flag-bad-input.js.map