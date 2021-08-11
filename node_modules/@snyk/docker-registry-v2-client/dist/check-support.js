"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSupport = void 0;
const contentTypes = require("./content-types");
const registry_call_1 = require("./registry-call");
/**
 * Root V2 endpoint, useful to check V2 support and validating credentials.
 */
async function checkSupport(registryBase, username, password, options = {}) {
    const result = await registry_call_1.registryV2Call(registryBase, "/", // full url path should be "/v2/" as per spec
    contentTypes.JSON, username, password, options);
    // always return thruthy object, even for ECR
    return result || {};
}
exports.checkSupport = checkSupport;
//# sourceMappingURL=check-support.js.map