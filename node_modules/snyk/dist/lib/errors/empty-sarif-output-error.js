"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SarifFileOutputEmptyError = void 0;
const custom_error_1 = require("./custom-error");
class SarifFileOutputEmptyError extends custom_error_1.CustomError {
    constructor() {
        super(SarifFileOutputEmptyError.ERROR_MESSAGE);
        this.code = SarifFileOutputEmptyError.ERROR_CODE;
        this.userMessage = SarifFileOutputEmptyError.ERROR_MESSAGE;
    }
}
exports.SarifFileOutputEmptyError = SarifFileOutputEmptyError;
SarifFileOutputEmptyError.ERROR_CODE = 422;
SarifFileOutputEmptyError.ERROR_MESSAGE = 'Empty --sarif-file-output argument. Did you mean --file=path/to/output-file.json ?';
//# sourceMappingURL=empty-sarif-output-error.js.map