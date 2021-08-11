"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = void 0;
const debugModule = require("debug");
// To enable debugging output, use `snyk -d`
function debug(s) {
    if (process.env.DEBUG) {
        debugModule.enable(process.env.DEBUG);
    }
    return debugModule(`snyk-java-call-graph-builder`)(s);
}
exports.debug = debug;
//# sourceMappingURL=debug.js.map