"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneTree = void 0;
const depGraphLib = require("@snyk/dep-graph");
async function pruneTree(tree, packageManagerName) {
    // Pruning requires conversion to the graph first.
    // This is slow.
    const graph = await depGraphLib.legacy.depTreeToGraph(tree, packageManagerName);
    const prunedTree = (await depGraphLib.legacy.graphToDepTree(graph, packageManagerName, { deduplicateWithinTopLevelDeps: true }));
    // Transplant pruned dependencies in the original tree (we want to keep all other fields):
    tree.dependencies = prunedTree.dependencies;
    return tree;
}
exports.pruneTree = pruneTree;
//# sourceMappingURL=prune-dep-tree.js.map