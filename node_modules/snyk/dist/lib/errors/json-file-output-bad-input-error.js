"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonFileOutputBadInputError = void 0;
const custom_error_1 = require("./custom-error");
class JsonFileOutputBadInputError extends custom_error_1.CustomError {
    constructor() {
        super(JsonFileOutputBadInputError.ERROR_MESSAGE);
        this.code = JsonFileOutputBadInputError.ERROR_CODE;
        this.userMessage = JsonFileOutputBadInputError.ERROR_MESSAGE;
    }
}
exports.JsonFileOutputBadInputError = JsonFileOutputBadInputError;
JsonFileOutputBadInputError.ERROR_CODE = 422;
JsonFileOutputBadInputError.ERROR_MESSAGE = 'Empty --json-file-output argument. Did you mean --file=path/to/output-file.json ?';
//# sourceMappingURL=json-file-output-bad-input-error.js.map