"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepos = void 0;
const contentTypes = require("./content-types");
const registry_call_1 = require("./registry-call");
async function getRepos(registryBase, username, password, pageSize = 100, maxPages = Number.MAX_SAFE_INTEGER, options = {}) {
    const endpoint = "/_catalog";
    return await registry_call_1.paginatedV2Call(registryBase, contentTypes.JSON, username, password, endpoint, "repositories", pageSize, maxPages, options);
}
exports.getRepos = getRepos;
//# sourceMappingURL=get-repos.js.map