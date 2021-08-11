"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryParseOptionalBoolean = exports.parseOptionalBoolean = exports.parseBoolean = exports.replaceEnvVariables = exports.buildIgnorePattern = exports.sortMap = exports.dynamicRequireNoCache = exports.dynamicRequire = exports.DefaultStream = exports.BufferStream = exports.bufferStream = exports.prettifySyncErrors = exports.prettifyAsyncErrors = exports.releaseAfterUseAsync = exports.getMapWithDefault = exports.getSetWithDefault = exports.getArrayWithDefault = exports.getFactoryWithDefault = exports.convertMapsToIndexableObjects = exports.isIndexableObject = exports.mapAndFind = exports.mapAndFilter = exports.validateEnum = exports.assertNever = exports.overrideType = exports.escapeRegExp = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const clipanion_1 = require("clipanion");
const micromatch_1 = tslib_1.__importDefault(require("micromatch"));
const stream_1 = require("stream");
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}
exports.escapeRegExp = escapeRegExp;
function overrideType(val) {
}
exports.overrideType = overrideType;
function assertNever(arg) {
    throw new Error(`Assertion failed: Unexpected object '${arg}'`);
}
exports.assertNever = assertNever;
function validateEnum(def, value) {
    if (!Object.values(def).includes(value))
        throw new Error(`Assertion failed: Invalid value for enumeration`);
    return value;
}
exports.validateEnum = validateEnum;
function mapAndFilter(iterable, cb) {
    const output = [];
    for (const value of iterable) {
        const out = cb(value);
        if (out !== mapAndFilterSkip) {
            output.push(out);
        }
    }
    return output;
}
exports.mapAndFilter = mapAndFilter;
const mapAndFilterSkip = Symbol();
mapAndFilter.skip = mapAndFilterSkip;
function mapAndFind(iterable, cb) {
    for (const value of iterable) {
        const out = cb(value);
        if (out !== mapAndFindSkip) {
            return out;
        }
    }
    return undefined;
}
exports.mapAndFind = mapAndFind;
const mapAndFindSkip = Symbol();
mapAndFind.skip = mapAndFindSkip;
function isIndexableObject(value) {
    return typeof value === `object` && value !== null;
}
exports.isIndexableObject = isIndexableObject;
/**
 * Converts Maps to indexable objects recursively.
 */
function convertMapsToIndexableObjects(arg) {
    if (arg instanceof Map)
        arg = Object.fromEntries(arg);
    if (isIndexableObject(arg)) {
        for (const key of Object.keys(arg)) {
            const value = arg[key];
            if (isIndexableObject(value)) {
                // @ts-expect-error: Apparently nothing in this world can be used to index type 'T & { [key: string]: unknown; }'
                arg[key] = convertMapsToIndexableObjects(value);
            }
        }
    }
    return arg;
}
exports.convertMapsToIndexableObjects = convertMapsToIndexableObjects;
function getFactoryWithDefault(map, key, factory) {
    let value = map.get(key);
    if (typeof value === `undefined`)
        map.set(key, value = factory());
    return value;
}
exports.getFactoryWithDefault = getFactoryWithDefault;
function getArrayWithDefault(map, key) {
    let value = map.get(key);
    if (typeof value === `undefined`)
        map.set(key, value = []);
    return value;
}
exports.getArrayWithDefault = getArrayWithDefault;
function getSetWithDefault(map, key) {
    let value = map.get(key);
    if (typeof value === `undefined`)
        map.set(key, value = new Set());
    return value;
}
exports.getSetWithDefault = getSetWithDefault;
function getMapWithDefault(map, key) {
    let value = map.get(key);
    if (typeof value === `undefined`)
        map.set(key, value = new Map());
    return value;
}
exports.getMapWithDefault = getMapWithDefault;
// Executes a chunk of code and calls a cleanup function once it returns (even
// if it throws an exception)
async function releaseAfterUseAsync(fn, cleanup) {
    if (cleanup == null)
        return await fn();
    try {
        return await fn();
    }
    finally {
        await cleanup();
    }
}
exports.releaseAfterUseAsync = releaseAfterUseAsync;
// Executes a chunk of code but slightly modify its exception message if it
// throws something
async function prettifyAsyncErrors(fn, update) {
    try {
        return await fn();
    }
    catch (error) {
        error.message = update(error.message);
        throw error;
    }
}
exports.prettifyAsyncErrors = prettifyAsyncErrors;
// Same thing but synchronous
function prettifySyncErrors(fn, update) {
    try {
        return fn();
    }
    catch (error) {
        error.message = update(error.message);
        throw error;
    }
}
exports.prettifySyncErrors = prettifySyncErrors;
// Converts a Node stream into a Buffer instance
async function bufferStream(stream) {
    return await new Promise((resolve, reject) => {
        const chunks = [];
        stream.on(`error`, error => {
            reject(error);
        });
        stream.on(`data`, chunk => {
            chunks.push(chunk);
        });
        stream.on(`end`, () => {
            resolve(Buffer.concat(chunks));
        });
    });
}
exports.bufferStream = bufferStream;
// A stream implementation that buffers a stream to send it all at once
class BufferStream extends stream_1.Transform {
    constructor() {
        super(...arguments);
        this.chunks = [];
    }
    _transform(chunk, encoding, cb) {
        if (encoding !== `buffer` || !Buffer.isBuffer(chunk))
            throw new Error(`Assertion failed: BufferStream only accept buffers`);
        this.chunks.push(chunk);
        cb(null, null);
    }
    _flush(cb) {
        cb(null, Buffer.concat(this.chunks));
    }
}
exports.BufferStream = BufferStream;
// A stream implementation that prints a message if nothing was output
class DefaultStream extends stream_1.Transform {
    constructor(ifEmpty = Buffer.alloc(0)) {
        super();
        this.active = true;
        this.ifEmpty = ifEmpty;
    }
    _transform(chunk, encoding, cb) {
        if (encoding !== `buffer` || !Buffer.isBuffer(chunk))
            throw new Error(`Assertion failed: DefaultStream only accept buffers`);
        this.active = false;
        cb(null, chunk);
    }
    _flush(cb) {
        if (this.active && this.ifEmpty.length > 0) {
            cb(null, this.ifEmpty);
        }
    }
}
exports.DefaultStream = DefaultStream;
// Webpack has this annoying tendency to replace dynamic requires by a stub
// code that simply throws when called. It's all fine and dandy in the context
// of a web application, but is quite annoying when working with Node projects!
function dynamicRequire(path) {
    // @ts-expect-error
    if (typeof __non_webpack_require__ !== `undefined`) {
        // @ts-expect-error
        return __non_webpack_require__(path);
    }
    else {
        return require(path);
    }
}
exports.dynamicRequire = dynamicRequire;
function dynamicRequireNoCache(path) {
    const physicalPath = fslib_1.npath.fromPortablePath(path);
    const currentCacheEntry = require.cache[physicalPath];
    delete require.cache[physicalPath];
    let result;
    try {
        result = dynamicRequire(physicalPath);
        const freshCacheEntry = require.cache[physicalPath];
        const freshCacheIndex = module.children.indexOf(freshCacheEntry);
        if (freshCacheIndex !== -1) {
            module.children.splice(freshCacheIndex, 1);
        }
    }
    finally {
        require.cache[physicalPath] = currentCacheEntry;
    }
    return result;
}
exports.dynamicRequireNoCache = dynamicRequireNoCache;
// This function transforms an iterable into an array and sorts it according to
// the mapper functions provided as parameter. The mappers are expected to take
// each element from the iterable and generate a string from it, that will then
// be used to compare the entries.
//
// Using sortMap is more efficient than kinda reimplementing the logic in a sort
// predicate because sortMap caches the result of the mappers in such a way that
// they are guaranteed to be executed exactly once for each element.
function sortMap(values, mappers) {
    const asArray = Array.from(values);
    if (!Array.isArray(mappers))
        mappers = [mappers];
    const stringified = [];
    for (const mapper of mappers)
        stringified.push(asArray.map(value => mapper(value)));
    const indices = asArray.map((_, index) => index);
    indices.sort((a, b) => {
        for (const layer of stringified) {
            const comparison = layer[a] < layer[b] ? -1 : layer[a] > layer[b] ? +1 : 0;
            if (comparison !== 0) {
                return comparison;
            }
        }
        return 0;
    });
    return indices.map(index => {
        return asArray[index];
    });
}
exports.sortMap = sortMap;
/**
 * Combines an Array of glob patterns into a regular expression.
 *
 * @param ignorePatterns An array of glob patterns
 *
 * @returns A `string` representing a regular expression or `null` if no glob patterns are provided
 */
function buildIgnorePattern(ignorePatterns) {
    if (ignorePatterns.length === 0)
        return null;
    return ignorePatterns.map(pattern => {
        return `(${micromatch_1.default.makeRe(pattern, {
            windows: false,
        }).source})`;
    }).join(`|`);
}
exports.buildIgnorePattern = buildIgnorePattern;
function replaceEnvVariables(value, { env }) {
    const regex = /\${(?<variableName>[\d\w_]+)(?<colon>:)?(?:-(?<fallback>[^}]*))?}/g;
    return value.replace(regex, (...args) => {
        const { variableName, colon, fallback } = args[args.length - 1];
        const variableExist = Object.prototype.hasOwnProperty.call(env, variableName);
        const variableValue = env[variableName];
        if (variableValue)
            return variableValue;
        if (variableExist && !colon)
            return variableValue;
        if (fallback != null)
            return fallback;
        throw new clipanion_1.UsageError(`Environment variable not found (${variableName})`);
    });
}
exports.replaceEnvVariables = replaceEnvVariables;
function parseBoolean(value) {
    switch (value) {
        case `true`:
        case `1`:
        case 1:
        case true: {
            return true;
        }
        case `false`:
        case `0`:
        case 0:
        case false: {
            return false;
        }
        default: {
            throw new Error(`Couldn't parse "${value}" as a boolean`);
        }
    }
}
exports.parseBoolean = parseBoolean;
function parseOptionalBoolean(value) {
    if (typeof value === `undefined`)
        return value;
    return parseBoolean(value);
}
exports.parseOptionalBoolean = parseOptionalBoolean;
function tryParseOptionalBoolean(value) {
    try {
        return parseOptionalBoolean(value);
    }
    catch (_a) {
        return null;
    }
}
exports.tryParseOptionalBoolean = tryParseOptionalBoolean;
