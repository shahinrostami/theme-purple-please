"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countTotalDependenciesInTree = void 0;
function countTotalDependenciesInTree(depTree) {
    let count = 0;
    if (depTree.dependencies) {
        for (const name of Object.keys(depTree.dependencies)) {
            const dep = depTree.dependencies[name];
            if (dep) {
                count += 1 + countTotalDependenciesInTree(dep);
            }
        }
    }
    return count;
}
exports.countTotalDependenciesInTree = countTotalDependenciesInTree;
//# sourceMappingURL=count-total-deps-in-tree.js.map