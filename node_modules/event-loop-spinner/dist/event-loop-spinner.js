"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLoopSpinner = void 0;
class EventLoopSpinner {
    constructor(thresholdMs = 10) {
        this.thresholdMs = thresholdMs;
        this.afterLastSpin = Date.now();
    }
    isStarving() {
        return Date.now() - this.afterLastSpin > this.thresholdMs;
    }
    async spin() {
        return new Promise((resolve) => setImmediate(() => {
            this.afterLastSpin = Date.now();
            resolve();
        }));
    }
}
exports.EventLoopSpinner = EventLoopSpinner;
//# sourceMappingURL=event-loop-spinner.js.map