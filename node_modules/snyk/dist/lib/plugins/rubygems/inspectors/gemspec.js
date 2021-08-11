"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gatherSpecs = exports.canHandle = void 0;
const path = require("path");
const try_get_spec_1 = require("./try-get-spec");
const pattern = /\.gemspec$/;
function canHandle(file) {
    return !!file && pattern.test(file);
}
exports.canHandle = canHandle;
async function gatherSpecs(root, target) {
    const targetName = path.basename(target);
    const targetDir = path.dirname(target);
    const files = {};
    const gemspec = await try_get_spec_1.tryGetSpec(root, path.join(targetDir, targetName));
    if (gemspec) {
        files.gemspec = gemspec;
    }
    else {
        throw new Error(`File not found: ${target}`);
    }
    const gemfileLock = await try_get_spec_1.tryGetSpec(root, path.join(targetDir, 'Gemfile.lock'));
    if (gemfileLock) {
        files.gemfileLock = gemfileLock;
    }
    return {
        packageName: path.basename(root),
        targetFile: path.join(targetDir, targetName),
        files,
    };
}
exports.gatherSpecs = gatherSpecs;
//# sourceMappingURL=gemspec.js.map