"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTags = void 0;
const registry_call_1 = require("./registry-call");
const contentTypes = require("./content-types");
async function getTags(registryBase, repo, username, password, pageSize = 1000, maxPages = Number.MAX_SAFE_INTEGER, options = {}) {
    const endpoint = `/${repo}/tags/list`;
    return await registry_call_1.paginatedV2Call(registryBase, contentTypes.JSON, username, password, endpoint, "tags", pageSize, maxPages, options);
}
exports.getTags = getTags;
//# sourceMappingURL=get-tags.js.map