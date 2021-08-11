"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const cmds = require("./composer-cmds");
function isSet(variable) {
    return typeof variable !== 'undefined';
}
function systemDeps(basePath, options) {
    const composerOk = isSet(options.composerIsFine) ? options.composerIsFine : cmds.cmdReturnsOk(cmds.composerCmd);
    const composerPharOk = isSet(options.composerPharIsFine) ?
        options.composerPharIsFine : cmds.cmdReturnsOk(cmds.pharCmd);
    let finalVersionsObj = {};
    if (options.systemVersions && (Object.keys(options.systemVersions).length > 0)) {
        // give first preference to a stub
        finalVersionsObj = options.systemVersions;
    }
    else if (composerOk) {
        const lines = cmds.execWithResult(cmds.composerShowCmd, basePath).split(os.EOL);
        lines.forEach((line) => {
            const [part1, part2] = line.split(/\s+/);
            if (part2) {
                finalVersionsObj[part1] = part2;
            }
        });
    }
    else if (composerPharOk) {
        const output = cmds.execWithResult(cmds.pharCmd, basePath);
        const versionsObj = JSON.parse(output).platform;
        versionsObj.forEach(({ name, version }) => {
            finalVersionsObj[name] = version;
        });
    }
    else {
        // TODO: tell the user we are not reporting accurately system versions, so some version info may not be exact
    }
    return finalVersionsObj;
}
exports.systemDeps = systemDeps;
//# sourceMappingURL=system-deps.js.map