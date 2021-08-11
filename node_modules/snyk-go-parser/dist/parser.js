"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toml = require("toml");
const errors_1 = require("./errors/");
// TODO(kyegupov): split into go-dep-parser and go-vendor-parser files
function parseGoPkgConfig(manifestFileContents, lockFileContents) {
    if (!manifestFileContents && !lockFileContents) {
        throw new errors_1.InvalidUserInputError('Gopkg.lock and Gopkg.toml file contents are empty');
    }
    if (!lockFileContents) {
        throw new errors_1.InvalidUserInputError('Gopkg.lock is empty, cannot proceed parsing');
    }
    const lockedVersions = parseDepLockContents(lockFileContents);
    let ignoredPkgs = [];
    if (manifestFileContents) {
        const manifest = parseDepManifestContents(manifestFileContents);
        ignoredPkgs = manifest.ignored;
    }
    return { lockedVersions, ignoredPkgs };
}
exports.parseGoPkgConfig = parseGoPkgConfig;
function parseGoVendorConfig(manifestFileContents) {
    if (!manifestFileContents) {
        throw new errors_1.InvalidUserInputError('vendor.json file contents are empty');
    }
    return parseGovendorJsonContents(manifestFileContents);
}
exports.parseGoVendorConfig = parseGoVendorConfig;
function parseDepLockContents(lockFileString) {
    try {
        const lockJson = toml.parse(lockFileString);
        const deps = {};
        if (lockJson.projects) {
            lockJson.projects.forEach((proj) => {
                const version = proj.version || ('#' + proj.revision);
                proj.packages.forEach((subpackageName) => {
                    const name = (subpackageName === '.' ?
                        proj.name :
                        proj.name + '/' + subpackageName);
                    const dep = {
                        name,
                        version,
                    };
                    deps[dep.name] = dep;
                });
            });
        }
        return deps;
    }
    catch (e) {
        throw new errors_1.InvalidUserInputError('Gopkg.lock parsing failed with error ' + e.message);
    }
}
function parseDepManifestContents(manifestToml) {
    try {
        const manifestJson = toml.parse(manifestToml) || {};
        manifestJson.ignored = manifestJson.ignored || [];
        return manifestJson;
    }
    catch (e) {
        throw new errors_1.InvalidUserInputError('Gopkg.toml parsing failed with error ' + e.message);
    }
}
// TODO: branch, old Version can be a tag too?
function parseGovendorJsonContents(jsonStr) {
    try {
        const gvJson = JSON.parse(jsonStr);
        const goProjectConfig = {
            ignoredPkgs: [],
            lockedVersions: {},
            packageName: gvJson.rootPath,
        };
        const packages = (gvJson.package || gvJson.Package);
        if (packages) {
            packages.forEach((pkg) => {
                const revision = pkg.revision || pkg.Revision || pkg.version || pkg.Version;
                const version = pkg.versionExact || ('#' + revision);
                const dep = {
                    name: pkg.path,
                    version,
                };
                goProjectConfig.lockedVersions[dep.name] = dep;
            });
        }
        const ignores = gvJson.ignore || '';
        ignores.split(/\s/).filter((s) => {
            // otherwise it's a build-tag rather than a pacakge
            return s.indexOf('/') !== -1;
        }).forEach((pkgName) => {
            pkgName = pkgName.replace(/\/+$/, ''); // remove trailing /
            goProjectConfig.ignoredPkgs.push(pkgName);
            goProjectConfig.ignoredPkgs.push(pkgName + '/*');
        });
        return goProjectConfig;
    }
    catch (e) {
        throw new errors_1.InvalidUserInputError('vendor.json parsing failed with error ' + e.message);
    }
}
exports.parseGovendorJsonContents = parseGovendorJsonContents;
//# sourceMappingURL=parser.js.map