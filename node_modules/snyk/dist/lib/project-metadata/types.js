"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGitTarget = void 0;
function isGitTarget(target) {
    return target && (target.branch || target.remoteUrl);
}
exports.isGitTarget = isGitTarget;
//# sourceMappingURL=types.js.map