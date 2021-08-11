"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partitionCycles = exports.getCycle = void 0;
function getCycle(ancestors, nodeId) {
    if (!ancestors.includes(nodeId)) {
        return null;
    }
    // first item is where the cycle starts and ends.
    return ancestors.slice(ancestors.indexOf(nodeId));
}
exports.getCycle = getCycle;
function partitionCycles(nodeId, allCyclesTheNodeIsPartOf) {
    const cyclesStartWithThisNode = [];
    const cyclesWithThisNode = [];
    for (const cycle of allCyclesTheNodeIsPartOf) {
        const nodeStartsCycle = cycle[0] === nodeId;
        if (nodeStartsCycle) {
            cyclesStartWithThisNode.push(cycle);
        }
        else {
            cyclesWithThisNode.push(cycle);
        }
    }
    return { cyclesStartWithThisNode, cyclesWithThisNode };
}
exports.partitionCycles = partitionCycles;
//# sourceMappingURL=cycles.js.map