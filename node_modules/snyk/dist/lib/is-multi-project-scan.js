"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMultiProjectScan = void 0;
function isMultiProjectScan(options) {
    return !!(options.allProjects || options.yarnWorkspaces);
}
exports.isMultiProjectScan = isMultiProjectScan;
//# sourceMappingURL=is-multi-project-scan.js.map