"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CycleException = exports.topsort = void 0;
const each = require("lodash.foreach");
const size = require("lodash.size");
function topsort(g) {
    const visited = {};
    const stack = {};
    const results = [];
    function visit(node) {
        if (node in stack) {
            throw new CycleException();
        }
        if (!(node in visited)) {
            stack[node] = true;
            visited[node] = true;
            each(g.predecessors(node), visit);
            delete stack[node];
            results.push(node);
        }
    }
    each(g.sinks(), visit);
    if (size(visited) !== g.nodeCount()) {
        throw new CycleException();
    }
    return results;
}
exports.topsort = topsort;
class CycleException extends Error {
}
exports.CycleException = CycleException;
//# sourceMappingURL=topsort.js.map