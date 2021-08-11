"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrowReport = void 0;
const Report_1 = require("./Report");
class ThrowReport extends Report_1.Report {
    reportCacheHit(locator) {
    }
    reportCacheMiss(locator) {
    }
    startTimerSync(what, opts, cb) {
        const realCb = typeof opts === `function` ? opts : cb;
        return realCb();
    }
    async startTimerPromise(what, opts, cb) {
        const realCb = typeof opts === `function` ? opts : cb;
        return await realCb();
    }
    async startCacheReport(cb) {
        return await cb();
    }
    reportSeparator() {
    }
    reportInfo(name, text) {
    }
    reportWarning(name, text) {
    }
    reportError(name, text) {
    }
    reportProgress(progress) {
        const promise = Promise.resolve().then(async () => {
            // eslint-disable-next-line no-empty-pattern
            for await (const {} of progress) {
                // No need to do anything; we just want to consume the progress events
            }
        });
        const stop = () => {
            // Nothing to stop
        };
        return { ...promise, stop };
    }
    reportJson(data) {
        // Just ignore the json output
    }
    async finalize() {
    }
}
exports.ThrowReport = ThrowReport;
