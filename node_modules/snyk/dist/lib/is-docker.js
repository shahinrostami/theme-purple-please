"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDocker = void 0;
const fs = require('fs');
function isDocker() {
    return hasDockerEnv() || hasDockerCGroup();
}
exports.isDocker = isDocker;
function hasDockerEnv() {
    try {
        fs.statSync('/.dockerenv');
        return true;
    }
    catch (_) {
        return false;
    }
}
function hasDockerCGroup() {
    try {
        return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
    }
    catch (_) {
        return false;
    }
}
//# sourceMappingURL=is-docker.js.map