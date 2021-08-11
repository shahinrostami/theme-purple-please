"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OutOfSyncError extends Error {
    constructor(dependencyName) {
        super(`Dependency ${dependencyName} was not found in paket.lock. Your ` +
            'paket.dependencies and paket.lock are probably out of sync. Please ' +
            'run "paket install" and try again.');
        this.code = 422;
        this.name = 'OutOfSyncError';
        this.dependencyName = dependencyName;
        Error.captureStackTrace(this, OutOfSyncError);
    }
}
exports.OutOfSyncError = OutOfSyncError;
//# sourceMappingURL=out-of-sync-error.js.map