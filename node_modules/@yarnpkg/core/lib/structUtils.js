"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdentVendorPath = exports.prettyDependent = exports.prettyResolution = exports.prettyWorkspace = exports.sortDescriptors = exports.prettyLocatorNoColors = exports.prettyLocator = exports.prettyReference = exports.prettyDescriptor = exports.prettyRange = exports.prettyIdent = exports.slugifyLocator = exports.slugifyIdent = exports.stringifyLocator = exports.stringifyDescriptor = exports.stringifyIdent = exports.requirableIdent = exports.convertToManifestRange = exports.makeRange = exports.parseFileStyleRange = exports.parseRange = exports.tryParseLocator = exports.parseLocator = exports.tryParseDescriptor = exports.parseDescriptor = exports.tryParseIdent = exports.parseIdent = exports.areVirtualPackagesEquivalent = exports.areLocatorsEqual = exports.areDescriptorsEqual = exports.areIdentsEqual = exports.bindLocator = exports.bindDescriptor = exports.devirtualizeLocator = exports.devirtualizeDescriptor = exports.isVirtualLocator = exports.isVirtualDescriptor = exports.virtualizePackage = exports.virtualizeDescriptor = exports.copyPackage = exports.renamePackage = exports.convertPackageToLocator = exports.convertLocatorToDescriptor = exports.convertDescriptorToLocator = exports.convertToIdent = exports.makeLocator = exports.makeDescriptor = exports.makeIdent = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const querystring_1 = tslib_1.__importDefault(require("querystring"));
const semver_1 = tslib_1.__importDefault(require("semver"));
const formatUtils = tslib_1.__importStar(require("./formatUtils"));
const hashUtils = tslib_1.__importStar(require("./hashUtils"));
const miscUtils = tslib_1.__importStar(require("./miscUtils"));
const structUtils = tslib_1.__importStar(require("./structUtils"));
const VIRTUAL_PROTOCOL = `virtual:`;
const VIRTUAL_ABBREVIATE = 5;
/**
 * Creates a package ident.
 *
 * @param scope The package scope without the `@` prefix (eg. `types`)
 * @param name The name of the package
 */
function makeIdent(scope, name) {
    if (scope === null || scope === void 0 ? void 0 : scope.startsWith(`@`))
        throw new Error(`Invalid scope: don't prefix it with '@'`);
    return { identHash: hashUtils.makeHash(scope, name), scope, name };
}
exports.makeIdent = makeIdent;
/**
 * Creates a package descriptor.
 *
 * @param ident The base ident (see `makeIdent`)
 * @param range The range to attach (eg. `^1.0.0`)
 */
function makeDescriptor(ident, range) {
    return { identHash: ident.identHash, scope: ident.scope, name: ident.name, descriptorHash: hashUtils.makeHash(ident.identHash, range), range };
}
exports.makeDescriptor = makeDescriptor;
/**
 * Creates a package locator.
 *
 * @param ident The base ident (see `makeIdent`)
 * @param range The reference to attach (eg. `1.0.0`)
 */
function makeLocator(ident, reference) {
    return { identHash: ident.identHash, scope: ident.scope, name: ident.name, locatorHash: hashUtils.makeHash(ident.identHash, reference), reference };
}
exports.makeLocator = makeLocator;
/**
 * Turns a compatible source to an ident. You won't really have to use this
 * function since by virtue of structural inheritance all descriptors and
 * locators are already valid idents.
 *
 * This function is only useful if you absolutely need to remove the non-ident
 * fields from a structure before storing it somewhere.
 *
 * @param source The data structure to convert into an ident.
 */
function convertToIdent(source) {
    return { identHash: source.identHash, scope: source.scope, name: source.name };
}
exports.convertToIdent = convertToIdent;
/**
 * Turns a descriptor into a locator.
 *
 * Note that this process may be unsafe, as descriptors may reference multiple
 * packages, putting them at odd with locators' expected semantic. Only makes
 * sense when used with single-resolution protocols, for instance `file:`.
 *
 * @param descriptor The descriptor to convert into a locator.
 */
function convertDescriptorToLocator(descriptor) {
    return { identHash: descriptor.identHash, scope: descriptor.scope, name: descriptor.name, locatorHash: descriptor.descriptorHash, reference: descriptor.range };
}
exports.convertDescriptorToLocator = convertDescriptorToLocator;
/**
 * Turns a locator into a descriptor.
 *
 * This should be safe to do regardless of the locator, since all locator
 * references are expected to be valid descriptor ranges.
 *
 * @param locator The locator to convert into a descriptor.
 */
function convertLocatorToDescriptor(locator) {
    return { identHash: locator.identHash, scope: locator.scope, name: locator.name, descriptorHash: locator.locatorHash, range: locator.reference };
}
exports.convertLocatorToDescriptor = convertLocatorToDescriptor;
/**
 * Turns a package structure into a simple locator. You won't often need to
 * call this function since packages are already valid locators by virtue of
 * structural inheritance.
 *
 * This function is only useful if you absolutely need to remove the
 * non-locator fields from a structure before storing it somewhere.
 *
 * @param pkg The package to convert into a locator.
 */
function convertPackageToLocator(pkg) {
    return { identHash: pkg.identHash, scope: pkg.scope, name: pkg.name, locatorHash: pkg.locatorHash, reference: pkg.reference };
}
exports.convertPackageToLocator = convertPackageToLocator;
/**
 * Deep copies a package then change its locator to something else.
 *
 * @param pkg The source package
 * @param locator Its new new locator
 */
function renamePackage(pkg, locator) {
    return {
        identHash: locator.identHash,
        scope: locator.scope,
        name: locator.name,
        locatorHash: locator.locatorHash,
        reference: locator.reference,
        version: pkg.version,
        languageName: pkg.languageName,
        linkType: pkg.linkType,
        dependencies: new Map(pkg.dependencies),
        peerDependencies: new Map(pkg.peerDependencies),
        dependenciesMeta: new Map(pkg.dependenciesMeta),
        peerDependenciesMeta: new Map(pkg.peerDependenciesMeta),
        bin: new Map(pkg.bin),
    };
}
exports.renamePackage = renamePackage;
/**
 * Deep copies a package. The copy will share the same locator as the original.
 *
 * @param pkg The source package
 */
function copyPackage(pkg) {
    return renamePackage(pkg, pkg);
}
exports.copyPackage = copyPackage;
/**
 * Creates a new virtual descriptor from a non virtual one.
 *
 * @param descriptor The descriptor to virtualize
 * @param entropy A hash that provides uniqueness to this virtualized descriptor (normally a locator hash)
 */
function virtualizeDescriptor(descriptor, entropy) {
    if (entropy.includes(`#`))
        throw new Error(`Invalid entropy`);
    return makeDescriptor(descriptor, `virtual:${entropy}#${descriptor.range}`);
}
exports.virtualizeDescriptor = virtualizeDescriptor;
/**
 * Creates a new virtual package from a non virtual one.
 *
 * @param pkg The package to virtualize
 * @param entropy A hash that provides uniqueness to this virtualized package (normally a locator hash)
 */
function virtualizePackage(pkg, entropy) {
    if (entropy.includes(`#`))
        throw new Error(`Invalid entropy`);
    return renamePackage(pkg, makeLocator(pkg, `virtual:${entropy}#${pkg.reference}`));
}
exports.virtualizePackage = virtualizePackage;
/**
 * Returns `true` if the descriptor is virtual.
 */
function isVirtualDescriptor(descriptor) {
    return descriptor.range.startsWith(VIRTUAL_PROTOCOL);
}
exports.isVirtualDescriptor = isVirtualDescriptor;
/**
 * Returns `true` if the locator is virtual.
 */
function isVirtualLocator(locator) {
    return locator.reference.startsWith(VIRTUAL_PROTOCOL);
}
exports.isVirtualLocator = isVirtualLocator;
/**
 * Returns a new devirtualized descriptor based on a virtualized descriptor
 */
function devirtualizeDescriptor(descriptor) {
    if (!isVirtualDescriptor(descriptor))
        throw new Error(`Not a virtual descriptor`);
    return makeDescriptor(descriptor, descriptor.range.replace(/^[^#]*#/, ``));
}
exports.devirtualizeDescriptor = devirtualizeDescriptor;
/**
 * Returns a new devirtualized locator based on a virtualized locator
 * @param locator the locator
 */
function devirtualizeLocator(locator) {
    if (!isVirtualLocator(locator))
        throw new Error(`Not a virtual descriptor`);
    return makeLocator(locator, locator.reference.replace(/^[^#]*#/, ``));
}
exports.devirtualizeLocator = devirtualizeLocator;
/**
 * Some descriptors only make sense when bound with some internal state. For
 * instance that would be the case for the `file:` ranges, which require to
 * be bound to their parent packages in order to resolve relative paths from
 * the right location.
 *
 * This function will apply the specified parameters onto the requested
 * descriptor, but only if it didn't get bound before (important to handle the
 * case where we replace a descriptor by another, since when that happens the
 * replacement has probably been already bound).
 *
 * @param descriptor The original descriptor
 * @param params The parameters to encode in the range
 */
function bindDescriptor(descriptor, params) {
    if (descriptor.range.includes(`::`))
        return descriptor;
    return makeDescriptor(descriptor, `${descriptor.range}::${querystring_1.default.stringify(params)}`);
}
exports.bindDescriptor = bindDescriptor;
/**
 * Some locators only make sense when bound with some internal state. For
 * instance that would be the case for the `file:` references, which require to
 * be bound to their parent packages in order to resolve relative paths from
 * the right location.
 *
 * This function will apply the specified parameters onto the requested
 * locator, but only if it didn't get bound before (important to handle the
 * case where we replace a locator by another, since when that happens the
 * replacement has probably been already bound).
 *
 * @param locator The original locator
 * @param params The parameters to encode in the reference
 */
function bindLocator(locator, params) {
    if (locator.reference.includes(`::`))
        return locator;
    return makeLocator(locator, `${locator.reference}::${querystring_1.default.stringify(params)}`);
}
exports.bindLocator = bindLocator;
/**
 * Returns `true` if the idents are equal
 */
function areIdentsEqual(a, b) {
    return a.identHash === b.identHash;
}
exports.areIdentsEqual = areIdentsEqual;
/**
 * Returns `true` if the descriptors are equal
 */
function areDescriptorsEqual(a, b) {
    return a.descriptorHash === b.descriptorHash;
}
exports.areDescriptorsEqual = areDescriptorsEqual;
/**
 * Returns `true` if the locators are equal
 */
function areLocatorsEqual(a, b) {
    return a.locatorHash === b.locatorHash;
}
exports.areLocatorsEqual = areLocatorsEqual;
/**
 * Virtual packages are considered equivalent when they belong to the same
 * package identity and have the same dependencies. Note that equivalence
 * is not the same as equality, as the references may be different.
 */
function areVirtualPackagesEquivalent(a, b) {
    if (!isVirtualLocator(a))
        throw new Error(`Invalid package type`);
    if (!isVirtualLocator(b))
        throw new Error(`Invalid package type`);
    if (!areIdentsEqual(a, b))
        return false;
    if (a.dependencies.size !== b.dependencies.size)
        return false;
    for (const dependencyDescriptorA of a.dependencies.values()) {
        const dependencyDescriptorB = b.dependencies.get(dependencyDescriptorA.identHash);
        if (!dependencyDescriptorB)
            return false;
        if (!areDescriptorsEqual(dependencyDescriptorA, dependencyDescriptorB)) {
            return false;
        }
    }
    return true;
}
exports.areVirtualPackagesEquivalent = areVirtualPackagesEquivalent;
/**
 * Parses a string into an ident.
 *
 * Throws an error if the ident cannot be parsed.
 *
 * @param string The ident string (eg. `@types/lodash`)
 */
function parseIdent(string) {
    const ident = tryParseIdent(string);
    if (!ident)
        throw new Error(`Invalid ident (${string})`);
    return ident;
}
exports.parseIdent = parseIdent;
/**
 * Parses a string into an ident.
 *
 * Returns `null` if the ident cannot be parsed.
 *
 * @param string The ident string (eg. `@types/lodash`)
 */
function tryParseIdent(string) {
    const match = string.match(/^(?:@([^/]+?)\/)?([^/]+)$/);
    if (!match)
        return null;
    const [, scope, name] = match;
    const realScope = typeof scope !== `undefined`
        ? scope
        : null;
    return makeIdent(realScope, name);
}
exports.tryParseIdent = tryParseIdent;
/**
 * Parses a `string` into a descriptor
 *
 * Throws an error if the descriptor cannot be parsed.
 *
 * @param string The descriptor string (eg. `lodash@^1.0.0`)
 * @param strict If `false`, the range is optional (`unknown` will be used as fallback)
 */
function parseDescriptor(string, strict = false) {
    const descriptor = tryParseDescriptor(string, strict);
    if (!descriptor)
        throw new Error(`Invalid descriptor (${string})`);
    return descriptor;
}
exports.parseDescriptor = parseDescriptor;
/**
 * Parses a `string` into a descriptor
 *
 * Returns `null` if the descriptor cannot be parsed.
 *
 * @param string The descriptor string (eg. `lodash@^1.0.0`)
 * @param strict If `false`, the range is optional (`unknown` will be used as fallback)
 */
function tryParseDescriptor(string, strict = false) {
    const match = strict
        ? string.match(/^(?:@([^/]+?)\/)?([^/]+?)(?:@(.+))$/)
        : string.match(/^(?:@([^/]+?)\/)?([^/]+?)(?:@(.+))?$/);
    if (!match)
        return null;
    const [, scope, name, range] = match;
    if (range === `unknown`)
        throw new Error(`Invalid range (${string})`);
    const realScope = typeof scope !== `undefined`
        ? scope
        : null;
    const realRange = typeof range !== `undefined`
        ? range
        : `unknown`;
    return makeDescriptor(makeIdent(realScope, name), realRange);
}
exports.tryParseDescriptor = tryParseDescriptor;
/**
 * Parses a `string` into a locator
 *
 * Throws an error if the locator cannot be parsed.
 *
 * @param string The locator `string` (eg. `lodash@1.0.0`)
 * @param strict If `false`, the reference is optional (`unknown` will be used as fallback)
 */
function parseLocator(string, strict = false) {
    const locator = tryParseLocator(string, strict);
    if (!locator)
        throw new Error(`Invalid locator (${string})`);
    return locator;
}
exports.parseLocator = parseLocator;
/**
 * Parses a `string` into a locator
 *
 * Returns `null` if the locator cannot be parsed.
 *
 * @param string The locator string (eg. `lodash@1.0.0`)
 * @param strict If `false`, the reference is optional (`unknown` will be used as fallback)
 */
function tryParseLocator(string, strict = false) {
    const match = strict
        ? string.match(/^(?:@([^/]+?)\/)?([^/]+?)(?:@(.+))$/)
        : string.match(/^(?:@([^/]+?)\/)?([^/]+?)(?:@(.+))?$/);
    if (!match)
        return null;
    const [, scope, name, reference] = match;
    if (reference === `unknown`)
        throw new Error(`Invalid reference (${string})`);
    const realScope = typeof scope !== `undefined`
        ? scope
        : null;
    const realReference = typeof reference !== `undefined`
        ? reference
        : `unknown`;
    return makeLocator(makeIdent(realScope, name), realReference);
}
exports.tryParseLocator = tryParseLocator;
/**
 * Parses a range into its constituents. Ranges typically follow these forms,
 * with both `protocol` and `bindings` being optionals:
 *
 * <protocol>:<selector>::<bindings>
 * <protocol>:<source>#<selector>::<bindings>
 *
 * The selector is intended to "refine" the source, and is required. The source
 * itself is optional (for instance we don't need it for npm packages, but we
 * do for git dependencies).
 */
function parseRange(range, opts) {
    const match = range.match(/^([^#:]*:)?((?:(?!::)[^#])*)(?:#((?:(?!::).)*))?(?:::(.*))?$/);
    if (match === null)
        throw new Error(`Invalid range (${range})`);
    const protocol = typeof match[1] !== `undefined`
        ? match[1]
        : null;
    if (typeof (opts === null || opts === void 0 ? void 0 : opts.requireProtocol) === `string` && protocol !== opts.requireProtocol)
        throw new Error(`Invalid protocol (${protocol})`);
    else if ((opts === null || opts === void 0 ? void 0 : opts.requireProtocol) && protocol === null)
        throw new Error(`Missing protocol (${protocol})`);
    const source = typeof match[3] !== `undefined`
        ? decodeURIComponent(match[2])
        : null;
    if ((opts === null || opts === void 0 ? void 0 : opts.requireSource) && source === null)
        throw new Error(`Missing source (${range})`);
    const rawSelector = typeof match[3] !== `undefined`
        ? decodeURIComponent(match[3])
        : decodeURIComponent(match[2]);
    const selector = (opts === null || opts === void 0 ? void 0 : opts.parseSelector)
        ? querystring_1.default.parse(rawSelector)
        : rawSelector;
    const params = typeof match[4] !== `undefined`
        ? querystring_1.default.parse(match[4])
        : null;
    return {
        // @ts-expect-error
        protocol,
        // @ts-expect-error
        source,
        // @ts-expect-error
        selector,
        // @ts-expect-error
        params,
    };
}
exports.parseRange = parseRange;
/**
 * File-style ranges are bound to a parent locators that we need in order to
 * resolve relative paths to the location of their parent packages. This
 * function wraps `parseRange` to automatically extract the parent locator
 * from the bindings and return it along with the selector.
 */
function parseFileStyleRange(range, { protocol }) {
    const { selector, params } = parseRange(range, {
        requireProtocol: protocol,
        requireBindings: true,
    });
    if (typeof params.locator !== `string`)
        throw new Error(`Assertion failed: Invalid bindings for ${range}`);
    const parentLocator = parseLocator(params.locator, true);
    const path = selector;
    return { parentLocator, path };
}
exports.parseFileStyleRange = parseFileStyleRange;
function encodeUnsafeCharacters(str) {
    str = str.replace(/%/g, `%25`);
    str = str.replace(/:/g, `%3A`);
    str = str.replace(/#/g, `%23`);
    return str;
}
function hasParams(params) {
    if (params === null)
        return false;
    return Object.entries(params).length > 0;
}
/**
 * Turn the components returned by `parseRange` back into a string. Check
 * `parseRange` for more details.
 */
function makeRange({ protocol, source, selector, params }) {
    let range = ``;
    if (protocol !== null)
        range += `${protocol}`;
    if (source !== null)
        range += `${encodeUnsafeCharacters(source)}#`;
    range += encodeUnsafeCharacters(selector);
    if (hasParams(params))
        range += `::${querystring_1.default.stringify(params)}`;
    return range;
}
exports.makeRange = makeRange;
/**
 * Some bindings are internal-only and not meant to be displayed anywhere (for
 * instance that's the case with the parent locator bound to the `file:` ranges).
 *
 * this function strips them from a range.
 */
function convertToManifestRange(range) {
    const { params, protocol, source, selector } = parseRange(range);
    for (const name in params)
        if (name.startsWith(`__`))
            delete params[name];
    return makeRange({ protocol, source, params, selector });
}
exports.convertToManifestRange = convertToManifestRange;
/**
 * @deprecated Prefer using `stringifyIdent`
 */
function requirableIdent(ident) {
    if (ident.scope) {
        return `@${ident.scope}/${ident.name}`;
    }
    else {
        return `${ident.name}`;
    }
}
exports.requirableIdent = requirableIdent;
/**
 * Returns a string from an ident (eg. `@types/lodash`).
 */
function stringifyIdent(ident) {
    if (ident.scope) {
        return `@${ident.scope}/${ident.name}`;
    }
    else {
        return `${ident.name}`;
    }
}
exports.stringifyIdent = stringifyIdent;
/**
 * Returns a string from a descriptor (eg. `@types/lodash@^1.0.0`).
 */
function stringifyDescriptor(descriptor) {
    if (descriptor.scope) {
        return `@${descriptor.scope}/${descriptor.name}@${descriptor.range}`;
    }
    else {
        return `${descriptor.name}@${descriptor.range}`;
    }
}
exports.stringifyDescriptor = stringifyDescriptor;
/**
 * Returns a string from a descriptor (eg. `@types/lodash@1.0.0`).
 */
function stringifyLocator(locator) {
    if (locator.scope) {
        return `@${locator.scope}/${locator.name}@${locator.reference}`;
    }
    else {
        return `${locator.name}@${locator.reference}`;
    }
}
exports.stringifyLocator = stringifyLocator;
/**
 * Returns a string from an ident, formatted as a slug (eg. `@types-lodash`).
 */
function slugifyIdent(ident) {
    if (ident.scope !== null) {
        return `@${ident.scope}-${ident.name}`;
    }
    else {
        return ident.name;
    }
}
exports.slugifyIdent = slugifyIdent;
/**
 * Returns a string from a locator, formatted as a slug (eg. `@types-lodash-npm-1.0.0-abcdef1234`).
 */
function slugifyLocator(locator) {
    const { protocol, selector } = parseRange(locator.reference);
    const humanProtocol = protocol !== null
        ? protocol.replace(/:$/, ``)
        : `exotic`;
    const humanVersion = semver_1.default.valid(selector);
    const humanReference = humanVersion !== null
        ? `${humanProtocol}-${humanVersion}`
        : `${humanProtocol}`;
    // 10 hex characters means that 47 different entries have 10^-9 chances of
    // causing a hash collision. Since this hash is joined with the package name
    // (making it highly unlikely you'll have more than a handful of instances
    // of any single package), this should provide a good enough guard in most
    // cases.
    //
    // Also note that eCryptfs eats some bytes, so the theoretical maximum for a
    // file size is around 140 bytes (but we don't need as much, as explained).
    const hashTruncate = 10;
    const slug = locator.scope
        ? `${slugifyIdent(locator)}-${humanReference}-${locator.locatorHash.slice(0, hashTruncate)}`
        : `${slugifyIdent(locator)}-${humanReference}-${locator.locatorHash.slice(0, hashTruncate)}`;
    return fslib_1.toFilename(slug);
}
exports.slugifyLocator = slugifyLocator;
/**
 * Returns a string that is suitable to be printed to stdout. Based on the
 * configuration it may include color sequences.
 *
 * @param configuration Reference configuration
 * @param ident The ident to pretty print
 */
function prettyIdent(configuration, ident) {
    if (ident.scope) {
        return `${formatUtils.pretty(configuration, `@${ident.scope}/`, formatUtils.Type.SCOPE)}${formatUtils.pretty(configuration, ident.name, formatUtils.Type.NAME)}`;
    }
    else {
        return `${formatUtils.pretty(configuration, ident.name, formatUtils.Type.NAME)}`;
    }
}
exports.prettyIdent = prettyIdent;
function prettyRangeNoColors(range) {
    if (range.startsWith(VIRTUAL_PROTOCOL)) {
        const nested = prettyRangeNoColors(range.substr(range.indexOf(`#`) + 1));
        const abbrev = range.substr(VIRTUAL_PROTOCOL.length, VIRTUAL_ABBREVIATE);
        // I'm not satisfied of how the virtual packages appear in the output
        // eslint-disable-next-line no-constant-condition
        return false ? `${nested} (virtual:${abbrev})` : `${nested} [${abbrev}]`;
    }
    else {
        return range.replace(/\?.*/, `?[...]`);
    }
}
/**
 * Returns a string that is suitable to be printed to stdout. Based on the
 * configuration it may include color sequences.
 *
 * @param configuration Reference configuration
 * @param ident The range to pretty print
 */
function prettyRange(configuration, range) {
    return `${formatUtils.pretty(configuration, prettyRangeNoColors(range), formatUtils.Type.RANGE)}`;
}
exports.prettyRange = prettyRange;
/**
 * Returns a string that is suitable to be printed to stdout. Based on the
 * configuration it may include color sequences.
 *
 * @param configuration Reference configuration
 * @param descriptor The descriptor to pretty print
 */
function prettyDescriptor(configuration, descriptor) {
    return `${prettyIdent(configuration, descriptor)}${formatUtils.pretty(configuration, `@`, formatUtils.Type.RANGE)}${prettyRange(configuration, descriptor.range)}`;
}
exports.prettyDescriptor = prettyDescriptor;
/**
 * Returns a string that is suitable to be printed to stdout. Based on the
 * configuration it may include color sequences.
 *
 * @param configuration Reference configuration
 * @param reference The reference to pretty print
 */
function prettyReference(configuration, reference) {
    return `${formatUtils.pretty(configuration, prettyRangeNoColors(reference), formatUtils.Type.REFERENCE)}`;
}
exports.prettyReference = prettyReference;
/**
 * Returns a string that is suitable to be printed to stdout. Based on the
 * configuration it may include color sequences.
 *
 * @param configuration Reference configuration
 * @param locator The locator to pretty print
 */
function prettyLocator(configuration, locator) {
    return `${prettyIdent(configuration, locator)}${formatUtils.pretty(configuration, `@`, formatUtils.Type.REFERENCE)}${prettyReference(configuration, locator.reference)}`;
}
exports.prettyLocator = prettyLocator;
/**
 * Returns a string that is suitable to be printed to stdout. It will never
 * be colored.
 *
 * @param locator The locator to pretty print
 */
function prettyLocatorNoColors(locator) {
    return `${stringifyIdent(locator)}@${prettyRangeNoColors(locator.reference)}`;
}
exports.prettyLocatorNoColors = prettyLocatorNoColors;
/**
 * Sorts a list of descriptors, first by their idents then by their ranges.
 */
function sortDescriptors(descriptors) {
    return miscUtils.sortMap(descriptors, [
        descriptor => stringifyIdent(descriptor),
        descriptor => descriptor.range,
    ]);
}
exports.sortDescriptors = sortDescriptors;
/**
 * Returns a string that is suitable to be printed to stdout. Based on the
 * configuration it may include color sequences.
 *
 * @param configuration Reference configuration
 * @param workspace The workspace to pretty print
 */
function prettyWorkspace(configuration, workspace) {
    return prettyIdent(configuration, workspace.locator);
}
exports.prettyWorkspace = prettyWorkspace;
/**
 * Returns a string that is suitable to be printed to stdout. Based on the
 * configuration it may include color sequences.
 *
 * @param configuration Reference configuration
 * @param descriptor The descriptor to pretty print
 * @param locator The locator is resolves to
 */
function prettyResolution(configuration, descriptor, locator) {
    const devirtualizedDescriptor = isVirtualDescriptor(descriptor)
        ? devirtualizeDescriptor(descriptor)
        : descriptor;
    if (locator === null) {
        return `${structUtils.prettyDescriptor(configuration, devirtualizedDescriptor)} → ${formatUtils.mark(configuration).Cross}`;
    }
    else if (devirtualizedDescriptor.identHash === locator.identHash) {
        return `${structUtils.prettyDescriptor(configuration, devirtualizedDescriptor)} → ${prettyReference(configuration, locator.reference)}`;
    }
    else {
        return `${structUtils.prettyDescriptor(configuration, devirtualizedDescriptor)} → ${prettyLocator(configuration, locator)}`;
    }
}
exports.prettyResolution = prettyResolution;
/**
 * Returns a string that is suitable to be printed to stdout. Based on the
 * configuration it may include color sequences.
 *
 * @param configuration Reference configuration
 * @param locator The locator to pretty print
 * @param descriptor The descriptor that depends on it
 */
function prettyDependent(configuration, locator, descriptor) {
    if (descriptor === null) {
        return `${prettyLocator(configuration, locator)}`;
    }
    else {
        return `${prettyLocator(configuration, locator)} (via ${structUtils.prettyRange(configuration, descriptor.range)})`;
    }
}
exports.prettyDependent = prettyDependent;
/**
 * The presence of a `node_modules` directory in the path is extremely common
 * in the JavaScript ecosystem to denote whether a path belongs to a vendor
 * or not. I considered using a more generic path for packages that aren't
 * always JS-only (such as when using the Git fetcher), but that unfortunately
 * caused various JS apps to start showing errors when working with git repos.
 *
 * As a result, all packages from all languages will follow this convention. At
 * least it'll be consistent, and linkers will always have the ability to remap
 * them to a different location if that's a critical requirement.
 */
function getIdentVendorPath(ident) {
    return `node_modules/${requirableIdent(ident)}`;
}
exports.getIdentVendorPath = getIdentVendorPath;
