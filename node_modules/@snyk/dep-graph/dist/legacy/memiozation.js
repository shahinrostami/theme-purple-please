"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemoizedDepTree = exports.memoize = void 0;
function memoize(nodeId, memoizationMap, depTree, partitionedCycles) {
    const { cyclesStartWithThisNode, cyclesWithThisNode } = partitionedCycles;
    if (cyclesStartWithThisNode.length > 0) {
        const cycleNodeIds = new Set(...cyclesStartWithThisNode);
        memoizationMap.set(nodeId, { depTree, cycleNodeIds });
    }
    else if (cyclesWithThisNode.length === 0) {
        memoizationMap.set(nodeId, { depTree });
    }
    // Don't memoize nodes in cycles (cyclesWithThisNode.length > 0)
}
exports.memoize = memoize;
function getMemoizedDepTree(nodeId, ancestors, memoizationMap) {
    if (!memoizationMap.has(nodeId))
        return null;
    const { depTree, cycleNodeIds } = memoizationMap.get(nodeId);
    if (!cycleNodeIds)
        return depTree;
    const ancestorsArePartOfTheCycle = ancestors.some((nodeId) => cycleNodeIds.has(nodeId));
    return ancestorsArePartOfTheCycle ? null : depTree;
}
exports.getMemoizedDepTree = getMemoizedDepTree;
//# sourceMappingURL=memiozation.js.map