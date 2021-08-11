"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFolderInside = exports.getHomeFolder = exports.getDefaultGlobalFolder = void 0;
const fslib_1 = require("@yarnpkg/fslib");
const os_1 = require("os");
function getDefaultGlobalFolder() {
    if (process.platform === `win32`) {
        const base = fslib_1.npath.toPortablePath(process.env.LOCALAPPDATA || fslib_1.npath.join(os_1.homedir(), `AppData`, `Local`));
        return fslib_1.ppath.resolve(base, `Yarn/Berry`);
    }
    if (process.env.XDG_DATA_HOME) {
        const base = fslib_1.npath.toPortablePath(process.env.XDG_DATA_HOME);
        return fslib_1.ppath.resolve(base, `yarn/berry`);
    }
    return fslib_1.ppath.resolve(getHomeFolder(), `.yarn/berry`);
}
exports.getDefaultGlobalFolder = getDefaultGlobalFolder;
function getHomeFolder() {
    return fslib_1.npath.toPortablePath(os_1.homedir() || `/usr/local/share`);
}
exports.getHomeFolder = getHomeFolder;
function isFolderInside(target, parent) {
    const relative = fslib_1.ppath.relative(parent, target);
    return relative && !relative.startsWith(`..`) && !fslib_1.ppath.isAbsolute(relative);
}
exports.isFolderInside = isFolderInside;
