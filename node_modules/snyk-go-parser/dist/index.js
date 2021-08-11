"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const parser_1 = require("./parser");
exports.parseGoPkgConfig = parser_1.parseGoPkgConfig;
exports.parseGoVendorConfig = parser_1.parseGoVendorConfig;
const gomod_parser_1 = require("./gomod-parser");
exports.parseGoMod = gomod_parser_1.parseGoMod;
exports.toSnykVersion = gomod_parser_1.toSnykVersion;
exports.parseVersion = gomod_parser_1.parseVersion;
// TODO(kyegupov): make all build* functions sync
// TODO(kyegupov): pin down the types for "options"
// Build dep tree from the manifest/lock files only.
// This does not scan the source code for imports, so it's not accurate;
// in particular, it cannot build the proper dependency graph (only a flat list).
function buildGoPkgDepTree(manifestFileContents, lockFileContents, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return buildGoDepTree(parser_1.parseGoPkgConfig(manifestFileContents, lockFileContents));
    });
}
exports.buildGoPkgDepTree = buildGoPkgDepTree;
// Build dep tree from the manifest/lock files only.
// This does not scan the source code for imports, so it's not accurate;
// in particular, it cannot build the proper dependency graph (only a flat list).
function buildGoVendorDepTree(manifestFileContents, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return buildGoDepTree(parser_1.parseGoVendorConfig(manifestFileContents));
    });
}
exports.buildGoVendorDepTree = buildGoVendorDepTree;
function buildGoDepTree(goProjectConfig) {
    const depTree = {
        name: goProjectConfig.packageName || 'root',
        version: '0.0.0',
        dependencies: {},
    };
    const dependencies = depTree.dependencies;
    for (const dep of Object.keys(goProjectConfig.lockedVersions)) {
        dependencies[dep] = {
            name: dep,
            version: goProjectConfig.lockedVersions[dep].version,
        };
    }
    return depTree;
}
//# sourceMappingURL=index.js.map