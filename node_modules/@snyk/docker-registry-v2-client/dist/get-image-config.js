"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageConfig = void 0;
const registry_call_1 = require("./registry-call");
const contentTypes = require("./content-types");
const needle_1 = require("./needle");
async function getImageConfig(registryBase, repo, digest, username, password, options = {}) {
    const endpoint = `/${repo}/blobs/${digest}`;
    const configResponse = await registry_call_1.registryV2Call(registryBase, endpoint, contentTypes.IMAGE_CONFIG, username, password, options);
    return needle_1.parseResponseBody(configResponse);
}
exports.getImageConfig = getImageConfig;
//# sourceMappingURL=get-image-config.js.map