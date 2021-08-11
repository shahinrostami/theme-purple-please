"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropEmptyDeps = void 0;
function dropEmptyDeps(depTree) {
    if (depTree.dependencies) {
        const keys = Object.keys(depTree.dependencies);
        if (keys.length === 0) {
            delete depTree.dependencies;
        }
        else {
            for (const k of keys) {
                dropEmptyDeps(depTree.dependencies[k]);
            }
        }
    }
    return depTree;
}
exports.dropEmptyDeps = dropEmptyDeps;
//# sourceMappingURL=drop-empty-deps.js.map