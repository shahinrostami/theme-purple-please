"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfo = void 0;
const url = require("url");
const subProcess = require("../../sub-process");
// for scp-like syntax [user@]server:project.git
const originRegex = /(.+@)?(.+):(.+$)/;
async function getInfo(isFromContainer) {
    // safety check
    if (isFromContainer) {
        return null;
    }
    const target = {};
    try {
        const origin = (await subProcess.execute('git', ['remote', 'get-url', 'origin'])).trim();
        if (origin) {
            const { protocol, host, pathname = '' } = url.parse(origin);
            // Not handling git:// as it has no connection options
            if (host && protocol && ['ssh:', 'http:', 'https:'].includes(protocol)) {
                // same format for parseable URLs
                target.remoteUrl = `http://${host}${pathname}`;
            }
            else {
                const originRes = originRegex.exec(origin);
                if (originRes && originRes[2] && originRes[3]) {
                    target.remoteUrl = `http://${originRes[2]}/${originRes[3]}`;
                }
                else {
                    // else keep the original
                    target.remoteUrl = origin;
                }
            }
        }
    }
    catch (err) {
        // Swallowing exception since we don't want to break the monitor if there is a problem
        // executing git commands.
    }
    try {
        target.branch = (await subProcess.execute('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).trim();
    }
    catch (err) {
        // Swallowing exception since we don't want to break the monitor if there is a problem
        // executing git commands.
    }
    return target;
}
exports.getInfo = getInfo;
//# sourceMappingURL=git.js.map