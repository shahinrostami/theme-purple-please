"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _findKey = require("lodash.findkey");
const _get = require("lodash.get");
const _invert = require("lodash.invert");
const _isEmpty = require("lodash.isempty");
const types_1 = require("../types");
const _ = {
    get: _get,
    isEmpty: _isEmpty,
    invert: _invert,
    findKey: _findKey,
};
class ComposerParser {
    static getVersion(depObj) {
        // check for `version` property. may not exist
        const versionFound = _.get(depObj, 'version', '');
        // even if found, may be an alias, so check
        const availableAliases = _.get(depObj, "extra['branch-alias']", []);
        // if the version matches the alias (either as is, or without 'dev-'), use the aliases version.
        // otherwise, use the version as is, and if not, the first found alias
        return _.get(availableAliases, versionFound) ||
            _.get(_.invert(availableAliases), versionFound.replace('dev-', '')) &&
                versionFound.replace('dev-', '') ||
            versionFound ||
            _.findKey(_.invert(availableAliases), '0'); // first available alias
    }
    static buildDependencies(composerJsonObj, composerLockObj, depObj, systemPackages, includeDev = false, isDevTree = false, depRecursiveArray = [], packageRefCount = {}) {
        const result = {};
        // find depObj properties
        const depName = _.get(depObj, 'name');
        const require = _.get(depObj, 'require', {});
        const requireDev = includeDev ? _.get(depObj, 'require-dev', {}) : {};
        // recursion tests
        const inRecursiveArray = depRecursiveArray.indexOf(depName) > -1;
        const exceedsMaxRepeats = packageRefCount[depName] >= this.MAX_PACKAGE_REPEATS;
        const hasNoDependencies = _.isEmpty(require) && _.isEmpty(requireDev);
        // break recursion when
        if (inRecursiveArray || exceedsMaxRepeats || hasNoDependencies) {
            return result;
        }
        // prevent circular dependencies
        depRecursiveArray.push(depName);
        // get locked packages
        const packages = _.get(composerLockObj, 'packages', []);
        const packagesDev = includeDev ? _.get(composerLockObj, 'packages-dev', []) : [];
        const allPackages = [
            ...packages,
            ...packagesDev,
        ];
        // parse require dependencies
        for (const name of Object.keys(require)) {
            let version = '';
            // lets find if this dependency has an object in composer.lock
            const lockedPackage = allPackages.find((dep) => dep.name === name);
            if (lockedPackage) {
                version = this.getVersion(lockedPackage);
            }
            else {
                // here we use the system version or composer json - not a locked version
                version = _.get(systemPackages, name) || _.get(require, name);
            }
            // remove any starting 'v' from version numbers
            version = version.replace(/^v(\d)/, '$1');
            // bump package reference count (or assign to 1 if we haven't seen this before)
            packageRefCount[name] = (packageRefCount[name] || 0) + 1;
            result[name] = {
                name,
                version,
                dependencies: this.buildDependencies(composerJsonObj, composerLockObj, lockedPackage, // undefined if transitive dependency
                systemPackages, includeDev, false, depRecursiveArray, packageRefCount),
                labels: {
                    scope: isDevTree ? types_1.Scope.dev : types_1.Scope.prod,
                },
            };
        }
        // parse require-dev dependencies
        for (const name of Object.keys(requireDev)) {
            let version = '';
            // lets find if this dependency has an object in composer.lock
            const lockedPackage = allPackages.find((dep) => dep.name === name);
            if (lockedPackage) {
                version = this.getVersion(lockedPackage);
            }
            else {
                // here we use the system version or composer json - not a locked version
                version = _.get(systemPackages, name) || _.get(requireDev, name);
            }
            // remove any starting 'v' from version numbers
            version = version.replace(/^v(\d)/, '$1');
            // bump package reference count (or assign to 1 if we haven't seen this before)
            packageRefCount[name] = (packageRefCount[name] || 0) + 1;
            result[name] = {
                name,
                version,
                dependencies: this.buildDependencies(composerJsonObj, composerLockObj, lockedPackage, // undefined if transitive dependency
                systemPackages, includeDev, true, depRecursiveArray, packageRefCount),
                labels: {
                    scope: types_1.Scope.dev,
                },
            };
        }
        // remove from recursive check
        depRecursiveArray.pop();
        // return dep tree
        return result;
    }
}
exports.ComposerParser = ComposerParser;
// After this threshold, a package node in the dep tree won't have expanded dependencies.
// This is a cheap protection against combinatorial explosion when there's N packages
// that depend on each other (producing N! branches of the dep tree).
// The value of 150 was chosen as a lowest one that doesn't break existing tests.
// Switching to dependency graph would render this trick obsolete.
ComposerParser.MAX_PACKAGE_REPEATS = 150;
//# sourceMappingURL=composer-parser.js.map