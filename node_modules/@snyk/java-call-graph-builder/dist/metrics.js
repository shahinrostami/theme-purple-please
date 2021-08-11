"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetrics = exports.timeIt = void 0;
const tslib_1 = require("tslib");
const metricsState = {
    getEntrypoints: { seconds: 0, nanoseconds: 0 },
    generateCallGraph: { seconds: 0, nanoseconds: 0 },
    mapClassesPerJar: { seconds: 0, nanoseconds: 0 },
    getCallGraph: { seconds: 0, nanoseconds: 0 },
};
function start(metric) {
    const [secs, nsecs] = process.hrtime();
    metricsState[metric] = { seconds: secs, nanoseconds: nsecs };
}
function stop(metric) {
    const { seconds, nanoseconds } = metricsState[metric] || {
        seconds: 0,
        nanoseconds: 0,
    };
    const [secs, nsecs] = process.hrtime([seconds, nanoseconds]);
    metricsState[metric] = { seconds: secs, nanoseconds: nsecs };
}
function getMetrics() {
    const metrics = {};
    for (const [metric, value] of Object.entries(metricsState)) {
        if (!value) {
            continue;
        }
        const { seconds, nanoseconds } = value;
        metrics[metric] = seconds + nanoseconds / 1e9;
    }
    return metrics;
}
exports.getMetrics = getMetrics;
function timeIt(metric, fn) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        start(metric);
        const x = yield fn();
        stop(metric);
        return x;
    });
}
exports.timeIt = timeIt;
//# sourceMappingURL=metrics.js.map