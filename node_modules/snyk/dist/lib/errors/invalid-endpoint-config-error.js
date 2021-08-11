"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidEndpointConfigError = void 0;
const custom_error_1 = require("./custom-error");
class InvalidEndpointConfigError extends custom_error_1.CustomError {
    constructor() {
        super(InvalidEndpointConfigError.ERROR_MESSAGE);
    }
}
exports.InvalidEndpointConfigError = InvalidEndpointConfigError;
InvalidEndpointConfigError.ERROR_MESSAGE = "Invalid 'endpoint' config option. Endpoint must be a full and valid URL including protocol and for Snyk.io it should contain path to '/api'";
//# sourceMappingURL=invalid-endpoint-config-error.js.map