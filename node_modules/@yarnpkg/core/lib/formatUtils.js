"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLogFilterSupport = exports.LogLevel = exports.mark = exports.json = exports.prettyList = exports.pretty = exports.applyColor = exports.applyStyle = exports.tuple = exports.supportsHyperlinks = exports.supportsColor = exports.Style = exports.Type = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const MessageName_1 = require("./MessageName");
const miscUtils = tslib_1.__importStar(require("./miscUtils"));
const structUtils = tslib_1.__importStar(require("./structUtils"));
const types_1 = require("./types");
var Type;
(function (Type) {
    Type["NO_HINT"] = "NO_HINT";
    Type["NULL"] = "NULL";
    Type["SCOPE"] = "SCOPE";
    Type["NAME"] = "NAME";
    Type["RANGE"] = "RANGE";
    Type["REFERENCE"] = "REFERENCE";
    Type["NUMBER"] = "NUMBER";
    Type["PATH"] = "PATH";
    Type["URL"] = "URL";
    Type["ADDED"] = "ADDED";
    Type["REMOVED"] = "REMOVED";
    Type["CODE"] = "CODE";
    Type["DURATION"] = "DURATION";
    Type["SIZE"] = "SIZE";
    Type["IDENT"] = "IDENT";
    Type["DESCRIPTOR"] = "DESCRIPTOR";
    Type["LOCATOR"] = "LOCATOR";
    Type["RESOLUTION"] = "RESOLUTION";
    Type["DEPENDENT"] = "DEPENDENT";
    Type["PACKAGE_EXTENSION"] = "PACKAGE_EXTENSION";
})(Type = exports.Type || (exports.Type = {}));
var Style;
(function (Style) {
    Style[Style["BOLD"] = 2] = "BOLD";
})(Style = exports.Style || (exports.Style = {}));
const chalkOptions = process.env.GITHUB_ACTIONS
    ? { level: 2 }
    : chalk_1.default.supportsColor
        ? { level: chalk_1.default.supportsColor.level }
        : { level: 0 };
exports.supportsColor = chalkOptions.level !== 0;
exports.supportsHyperlinks = exports.supportsColor && !process.env.GITHUB_ACTIONS;
const chalkInstance = new chalk_1.default.Instance(chalkOptions);
const colors = new Map([
    [Type.NO_HINT, null],
    [Type.NULL, [`#a853b5`, 129]],
    [Type.SCOPE, [`#d75f00`, 166]],
    [Type.NAME, [`#d7875f`, 173]],
    [Type.RANGE, [`#00afaf`, 37]],
    [Type.REFERENCE, [`#87afff`, 111]],
    [Type.NUMBER, [`#ffd700`, 220]],
    [Type.PATH, [`#d75fd7`, 170]],
    [Type.URL, [`#d75fd7`, 170]],
    [Type.ADDED, [`#5faf00`, 70]],
    [Type.REMOVED, [`#d70000`, 160]],
    [Type.CODE, [`#87afff`, 111]],
    [Type.SIZE, [`#ffd700`, 220]],
]);
// Just to make sure that the individual fields of the transform map have
// compatible parameter types, without upcasting the map to a too generic type
//
// We also take the opportunity to downcast the configuration into `any`,
// otherwise TypeScript will detect a circular reference and won't allow us to
// properly type the `format` method from Configuration. Since transforms are
// internal to this file, it should be fine.
const validateTransform = (spec) => spec;
const transforms = {
    [Type.NUMBER]: validateTransform({
        pretty: (configuration, value) => {
            return `${value}`;
        },
        json: (value) => {
            return value;
        },
    }),
    [Type.IDENT]: validateTransform({
        pretty: (configuration, ident) => {
            return structUtils.prettyIdent(configuration, ident);
        },
        json: (ident) => {
            return structUtils.stringifyIdent(ident);
        },
    }),
    [Type.LOCATOR]: validateTransform({
        pretty: (configuration, locator) => {
            return structUtils.prettyLocator(configuration, locator);
        },
        json: (locator) => {
            return structUtils.stringifyLocator(locator);
        },
    }),
    [Type.DESCRIPTOR]: validateTransform({
        pretty: (configuration, descriptor) => {
            return structUtils.prettyDescriptor(configuration, descriptor);
        },
        json: (descriptor) => {
            return structUtils.stringifyDescriptor(descriptor);
        },
    }),
    [Type.RESOLUTION]: validateTransform({
        pretty: (configuration, { descriptor, locator }) => {
            return structUtils.prettyResolution(configuration, descriptor, locator);
        },
        json: ({ descriptor, locator }) => {
            return {
                descriptor: structUtils.stringifyDescriptor(descriptor),
                locator: locator !== null
                    ? structUtils.stringifyLocator(locator)
                    : null,
            };
        },
    }),
    [Type.DEPENDENT]: validateTransform({
        pretty: (configuration, { locator, descriptor }) => {
            return structUtils.prettyDependent(configuration, locator, descriptor);
        },
        json: ({ locator, descriptor }) => {
            return {
                locator: structUtils.stringifyLocator(locator),
                descriptor: structUtils.stringifyDescriptor(descriptor),
            };
        },
    }),
    [Type.PACKAGE_EXTENSION]: validateTransform({
        pretty: (configuration, packageExtension) => {
            switch (packageExtension.type) {
                case types_1.PackageExtensionType.Dependency:
                    return `${structUtils.prettyIdent(configuration, packageExtension.parentDescriptor)} ➤ ${applyColor(configuration, `dependencies`, Type.CODE)} ➤ ${structUtils.prettyIdent(configuration, packageExtension.descriptor)}`;
                case types_1.PackageExtensionType.PeerDependency:
                    return `${structUtils.prettyIdent(configuration, packageExtension.parentDescriptor)} ➤ ${applyColor(configuration, `peerDependencies`, Type.CODE)} ➤ ${structUtils.prettyIdent(configuration, packageExtension.descriptor)}`;
                case types_1.PackageExtensionType.PeerDependencyMeta:
                    return `${structUtils.prettyIdent(configuration, packageExtension.parentDescriptor)} ➤ ${applyColor(configuration, `peerDependenciesMeta`, Type.CODE)} ➤ ${structUtils.prettyIdent(configuration, structUtils.parseIdent(packageExtension.selector))} ➤ ${applyColor(configuration, packageExtension.key, Type.CODE)}`;
                default:
                    throw new Error(`Assertion failed: Unsupported package extension type: ${packageExtension.type}`);
            }
        },
        json: (packageExtension) => {
            switch (packageExtension.type) {
                case types_1.PackageExtensionType.Dependency:
                    return `${structUtils.stringifyIdent(packageExtension.parentDescriptor)} > ${structUtils.stringifyIdent(packageExtension.descriptor)}`;
                case types_1.PackageExtensionType.PeerDependency:
                    return `${structUtils.stringifyIdent(packageExtension.parentDescriptor)} >> ${structUtils.stringifyIdent(packageExtension.descriptor)}`;
                case types_1.PackageExtensionType.PeerDependencyMeta:
                    return `${structUtils.stringifyIdent(packageExtension.parentDescriptor)} >> ${packageExtension.selector} / ${packageExtension.key}`;
                default:
                    throw new Error(`Assertion failed: Unsupported package extension type: ${packageExtension.type}`);
            }
        },
    }),
    [Type.DURATION]: validateTransform({
        pretty: (configuration, duration) => {
            if (duration > 1000 * 60) {
                const minutes = Math.floor(duration / 1000 / 60);
                const seconds = Math.ceil((duration - minutes * 60 * 1000) / 1000);
                return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
            }
            else {
                const seconds = Math.floor(duration / 1000);
                const milliseconds = duration - seconds * 1000;
                return milliseconds === 0 ? `${seconds}s` : `${seconds}s ${milliseconds}ms`;
            }
        },
        json: (duration) => {
            return duration;
        },
    }),
    [Type.SIZE]: validateTransform({
        pretty: (configuration, size) => {
            const thresholds = [`KB`, `MB`, `GB`, `TB`];
            let power = thresholds.length;
            while (power > 1 && size < 1024 ** power)
                power -= 1;
            const factor = 1024 ** power;
            const value = Math.floor(size * 100 / factor) / 100;
            return applyColor(configuration, `${value} ${thresholds[power - 1]}`, Type.NUMBER);
        },
        json: (size) => {
            return size;
        },
    }),
    [Type.PATH]: validateTransform({
        pretty: (configuration, filePath) => {
            return applyColor(configuration, fslib_1.npath.fromPortablePath(filePath), Type.PATH);
        },
        json: (filePath) => {
            return fslib_1.npath.fromPortablePath(filePath);
        },
    }),
};
function tuple(formatType, value) {
    return [value, formatType];
}
exports.tuple = tuple;
function applyStyle(configuration, text, flags) {
    if (!configuration.get(`enableColors`))
        return text;
    if (flags & Style.BOLD)
        text = chalk_1.default.bold(text);
    return text;
}
exports.applyStyle = applyStyle;
function applyColor(configuration, value, formatType) {
    if (!configuration.get(`enableColors`))
        return value;
    const colorSpec = colors.get(formatType);
    if (colorSpec === null)
        return value;
    const color = typeof colorSpec === `undefined`
        ? formatType
        : chalkOptions.level >= 3
            ? colorSpec[0]
            : colorSpec[1];
    const fn = typeof color === `number`
        ? chalkInstance.ansi256(color)
        : color.startsWith(`#`)
            ? chalkInstance.hex(color)
            : chalkInstance[color];
    if (typeof fn !== `function`)
        throw new Error(`Invalid format type ${color}`);
    return fn(value);
}
exports.applyColor = applyColor;
function pretty(configuration, value, formatType) {
    if (value === null)
        return applyColor(configuration, `null`, Type.NULL);
    if (Object.prototype.hasOwnProperty.call(transforms, formatType)) {
        const transform = transforms[formatType];
        const typedTransform = transform;
        return typedTransform.pretty(configuration, value);
    }
    if (typeof value !== `string`)
        throw new Error(`Assertion failed: Expected the value to be a string, got ${typeof value}`);
    return applyColor(configuration, value, formatType);
}
exports.pretty = pretty;
function prettyList(configuration, values, formatType, { separator = `, ` } = {}) {
    return [...values].map(value => pretty(configuration, value, formatType)).join(separator);
}
exports.prettyList = prettyList;
function json(value, formatType) {
    if (value === null)
        return null;
    if (Object.prototype.hasOwnProperty.call(transforms, formatType)) {
        miscUtils.overrideType(formatType);
        return transforms[formatType].json(value);
    }
    if (typeof value !== `string`)
        throw new Error(`Assertion failed: Expected the value to be a string, got ${typeof value}`);
    return value;
}
exports.json = json;
function mark(configuration) {
    return {
        Check: applyColor(configuration, `✓`, `green`),
        Cross: applyColor(configuration, `✘`, `red`),
        Question: applyColor(configuration, `?`, `cyan`),
    };
}
exports.mark = mark;
var LogLevel;
(function (LogLevel) {
    LogLevel["Error"] = "error";
    LogLevel["Warning"] = "warning";
    LogLevel["Info"] = "info";
    LogLevel["Discard"] = "discard";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
/**
 * Add support support for the `logFilters` setting to the specified Report
 * instance.
 */
function addLogFilterSupport(report, { configuration }) {
    const logFilters = configuration.get(`logFilters`);
    const logFiltersByCode = new Map();
    const logFiltersByText = new Map();
    for (const filter of logFilters) {
        const level = filter.get(`level`);
        if (typeof level === `undefined`)
            continue;
        const code = filter.get(`code`);
        if (typeof code !== `undefined`)
            logFiltersByCode.set(code, level);
        const text = filter.get(`text`);
        if (typeof text !== `undefined`) {
            logFiltersByText.set(text, level);
        }
    }
    const findLogLevel = (name, text, defaultLevel) => {
        if (name === null || name === MessageName_1.MessageName.UNNAMED)
            return defaultLevel;
        if (logFiltersByText.size > 0) {
            const level = logFiltersByText.get(chalk_1.default.reset(text));
            if (typeof level !== `undefined`) {
                return level !== null && level !== void 0 ? level : defaultLevel;
            }
        }
        if (logFiltersByCode.size > 0) {
            const level = logFiltersByCode.get(MessageName_1.stringifyMessageName(name));
            if (typeof level !== `undefined`) {
                return level !== null && level !== void 0 ? level : defaultLevel;
            }
        }
        return defaultLevel;
    };
    const reportInfo = report.reportInfo;
    const reportWarning = report.reportWarning;
    const reportError = report.reportError;
    const routeMessage = function (report, name, text, level) {
        switch (findLogLevel(name, text, level)) {
            case LogLevel.Info:
                {
                    reportInfo.call(report, name, text);
                }
                break;
            case LogLevel.Warning:
                {
                    reportWarning.call(report, name !== null && name !== void 0 ? name : MessageName_1.MessageName.UNNAMED, text);
                }
                break;
            case LogLevel.Error:
                {
                    reportError.call(report, name !== null && name !== void 0 ? name : MessageName_1.MessageName.UNNAMED, text);
                }
                break;
        }
    };
    report.reportInfo = function (...args) {
        return routeMessage(this, ...args, LogLevel.Info);
    };
    report.reportWarning = function (...args) {
        return routeMessage(this, ...args, LogLevel.Warning);
    };
    report.reportError = function (...args) {
        return routeMessage(this, ...args, LogLevel.Error);
    };
}
exports.addLogFilterSupport = addLogFilterSupport;
