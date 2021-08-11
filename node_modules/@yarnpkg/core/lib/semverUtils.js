"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validRange = exports.satisfiesWithPrereleases = void 0;
const tslib_1 = require("tslib");
const semver_1 = tslib_1.__importDefault(require("semver"));
/**
 * Returns whether the given semver version satisfies the given range. Notably
 * this supports prerelease versions so that "2.0.0-rc.0" satisfies the range
 * ">=1.0.0", for example.
 *
 * This function exists because the semver.satisfies method does not include
 * pre releases. This means ranges such as * would not satisfy 1.0.0-rc. The
 * includePrerelease flag has a weird behavior and cannot be used (if you want
 * to try it out, just run the `semverUtils` testsuite using this flag instead
 * of our own implementation, and you'll see the failing cases).
 *
 * See https://github.com/yarnpkg/berry/issues/575 for more context.
 */
function satisfiesWithPrereleases(version, range, loose = false) {
    let semverRange;
    try {
        semverRange = new semver_1.default.Range(range, { includePrerelease: true, loose });
    }
    catch (err) {
        return false;
    }
    if (!version)
        return false;
    let semverVersion;
    try {
        semverVersion = new semver_1.default.SemVer(version, semverRange);
        if (semverVersion.prerelease) {
            semverVersion.prerelease = [];
        }
    }
    catch (err) {
        return false;
    }
    // A range has multiple sets of comparators. A version must satisfy all
    // comparators in a set and at least one set to satisfy the range.
    return semverRange.set.some(comparatorSet => {
        for (const comparator of comparatorSet)
            if (comparator.semver.prerelease)
                comparator.semver.prerelease = [];
        return comparatorSet.every(comparator => {
            return comparator.test(semverVersion);
        });
    });
}
exports.satisfiesWithPrereleases = satisfiesWithPrereleases;
const rangesCache = new Map();
/**
 * A cached version of `new semver.Range(potentialRange)` that returns `null` on invalid ranges
 */
function validRange(potentialRange) {
    if (potentialRange.indexOf(`:`) !== -1)
        return null;
    let range = rangesCache.get(potentialRange);
    if (typeof range !== `undefined`)
        return range;
    try {
        range = new semver_1.default.Range(potentialRange);
    }
    catch (_a) {
        range = null;
    }
    rangesCache.set(potentialRange, range);
    return range;
}
exports.validRange = validRange;
