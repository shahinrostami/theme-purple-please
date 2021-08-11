import semver from 'semver';
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
export declare function satisfiesWithPrereleases(version: string | null, range: string, loose?: boolean): boolean;
/**
 * A cached version of `new semver.Range(potentialRange)` that returns `null` on invalid ranges
 */
export declare function validRange(potentialRange: string): semver.Range | null;
