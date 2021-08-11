"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = exports.ProjectLookup = exports.coreDefinitions = exports.FormatType = exports.SettingsType = exports.SECRET = exports.DEFAULT_LOCK_FILENAME = exports.DEFAULT_RC_FILENAME = exports.ENVIRONMENT_PREFIX = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const fslib_2 = require("@yarnpkg/fslib");
const parsers_1 = require("@yarnpkg/parsers");
const camelcase_1 = tslib_1.__importDefault(require("camelcase"));
const ci_info_1 = require("ci-info");
const clipanion_1 = require("clipanion");
const p_limit_1 = tslib_1.__importDefault(require("p-limit"));
const semver_1 = tslib_1.__importDefault(require("semver"));
const stream_1 = require("stream");
const CorePlugin_1 = require("./CorePlugin");
const Manifest_1 = require("./Manifest");
const MultiFetcher_1 = require("./MultiFetcher");
const MultiResolver_1 = require("./MultiResolver");
const ProtocolResolver_1 = require("./ProtocolResolver");
const VirtualFetcher_1 = require("./VirtualFetcher");
const VirtualResolver_1 = require("./VirtualResolver");
const WorkspaceFetcher_1 = require("./WorkspaceFetcher");
const WorkspaceResolver_1 = require("./WorkspaceResolver");
const folderUtils = tslib_1.__importStar(require("./folderUtils"));
const formatUtils = tslib_1.__importStar(require("./formatUtils"));
const miscUtils = tslib_1.__importStar(require("./miscUtils"));
const nodeUtils = tslib_1.__importStar(require("./nodeUtils"));
const semverUtils = tslib_1.__importStar(require("./semverUtils"));
const structUtils = tslib_1.__importStar(require("./structUtils"));
const types_1 = require("./types");
const IGNORED_ENV_VARIABLES = new Set([
    // "binFolder" is the magic location where the parent process stored the
    // current binaries; not an actual configuration settings
    `binFolder`,
    // "version" is set by Docker:
    // https://github.com/nodejs/docker-node/blob/5a6a5e91999358c5b04fddd6c22a9a4eb0bf3fbf/10/alpine/Dockerfile#L51
    `version`,
    // "flags" is set by Netlify; they use it to specify the flags to send to the
    // CLI when running the automatic `yarn install`
    `flags`,
    // "gpg" and "profile" are used by the install.sh script:
    // https://classic.yarnpkg.com/install.sh
    `profile`,
    `gpg`,
    // "ignoreNode" is used to disable the Node version check
    `ignoreNode`,
    // "wrapOutput" was a variable used to indicate nested "yarn run" processes
    // back in Yarn 1.
    `wrapOutput`,
]);
exports.ENVIRONMENT_PREFIX = `yarn_`;
exports.DEFAULT_RC_FILENAME = `.yarnrc.yml`;
exports.DEFAULT_LOCK_FILENAME = `yarn.lock`;
exports.SECRET = `********`;
var SettingsType;
(function (SettingsType) {
    SettingsType["ANY"] = "ANY";
    SettingsType["BOOLEAN"] = "BOOLEAN";
    SettingsType["ABSOLUTE_PATH"] = "ABSOLUTE_PATH";
    SettingsType["LOCATOR"] = "LOCATOR";
    SettingsType["LOCATOR_LOOSE"] = "LOCATOR_LOOSE";
    SettingsType["NUMBER"] = "NUMBER";
    SettingsType["STRING"] = "STRING";
    SettingsType["SECRET"] = "SECRET";
    SettingsType["SHAPE"] = "SHAPE";
    SettingsType["MAP"] = "MAP";
})(SettingsType = exports.SettingsType || (exports.SettingsType = {}));
exports.FormatType = formatUtils.Type;
// General rules:
//
// - filenames that don't accept actual paths must end with the "Filename" suffix
//   prefer to use absolute paths instead, since they are automatically resolved
//   ex: lockfileFilename
//
// - folders must end with the "Folder" suffix
//   ex: cacheFolder, pnpVirtualFolder
//
// - actual paths to a file must end with the "Path" suffix
//   ex: pnpPath
//
// - options that tweaks the strictness must begin with the "allow" prefix
//   ex: allowInvalidChecksums
//
// - options that enable a feature must begin with the "enable" prefix
//   ex: enableEmojis, enableColors
exports.coreDefinitions = {
    // Not implemented for now, but since it's part of all Yarn installs we want to declare it in order to improve drop-in compatibility
    lastUpdateCheck: {
        description: `Last timestamp we checked whether new Yarn versions were available`,
        type: SettingsType.STRING,
        default: null,
    },
    // Settings related to proxying all Yarn calls to a specific executable
    yarnPath: {
        description: `Path to the local executable that must be used over the global one`,
        type: SettingsType.ABSOLUTE_PATH,
        default: null,
    },
    ignorePath: {
        description: `If true, the local executable will be ignored when using the global one`,
        type: SettingsType.BOOLEAN,
        default: false,
    },
    ignoreCwd: {
        description: `If true, the \`--cwd\` flag will be ignored`,
        type: SettingsType.BOOLEAN,
        default: false,
    },
    // Settings related to the package manager internal names
    cacheKeyOverride: {
        description: `A global cache key override; used only for test purposes`,
        type: SettingsType.STRING,
        default: null,
    },
    globalFolder: {
        description: `Folder where are stored the system-wide settings`,
        type: SettingsType.ABSOLUTE_PATH,
        default: folderUtils.getDefaultGlobalFolder(),
    },
    cacheFolder: {
        description: `Folder where the cache files must be written`,
        type: SettingsType.ABSOLUTE_PATH,
        default: `./.yarn/cache`,
    },
    compressionLevel: {
        description: `Zip files compression level, from 0 to 9 or mixed (a variant of 9, which stores some files uncompressed, when compression doesn't yield good results)`,
        type: SettingsType.NUMBER,
        values: [`mixed`, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        default: fslib_2.DEFAULT_COMPRESSION_LEVEL,
    },
    virtualFolder: {
        description: `Folder where the virtual packages (cf doc) will be mapped on the disk (must be named $$virtual)`,
        type: SettingsType.ABSOLUTE_PATH,
        default: `./.yarn/$$virtual`,
    },
    bstatePath: {
        description: `Path of the file where the current state of the built packages must be stored`,
        type: SettingsType.ABSOLUTE_PATH,
        default: `./.yarn/build-state.yml`,
    },
    lockfileFilename: {
        description: `Name of the files where the Yarn dependency tree entries must be stored`,
        type: SettingsType.STRING,
        default: exports.DEFAULT_LOCK_FILENAME,
    },
    installStatePath: {
        description: `Path of the file where the install state will be persisted`,
        type: SettingsType.ABSOLUTE_PATH,
        default: `./.yarn/install-state.gz`,
    },
    immutablePatterns: {
        description: `Array of glob patterns; files matching them won't be allowed to change during immutable installs`,
        type: SettingsType.STRING,
        default: [],
        isArray: true,
    },
    rcFilename: {
        description: `Name of the files where the configuration can be found`,
        type: SettingsType.STRING,
        default: getRcFilename(),
    },
    enableGlobalCache: {
        description: `If true, the system-wide cache folder will be used regardless of \`cache-folder\``,
        type: SettingsType.BOOLEAN,
        default: false,
    },
    enableAbsoluteVirtuals: {
        description: `If true, the virtual symlinks will use absolute paths if required [non portable!!]`,
        type: SettingsType.BOOLEAN,
        default: false,
    },
    // Settings related to the output style
    enableColors: {
        description: `If true, the CLI is allowed to use colors in its output`,
        type: SettingsType.BOOLEAN,
        default: formatUtils.supportsColor,
        defaultText: `<dynamic>`,
    },
    enableHyperlinks: {
        description: `If true, the CLI is allowed to use hyperlinks in its output`,
        type: SettingsType.BOOLEAN,
        default: formatUtils.supportsHyperlinks,
        defaultText: `<dynamic>`,
    },
    enableInlineBuilds: {
        description: `If true, the CLI will print the build output on the command line`,
        type: SettingsType.BOOLEAN,
        default: ci_info_1.isCI,
        defaultText: `<dynamic>`,
    },
    enableProgressBars: {
        description: `If true, the CLI is allowed to show a progress bar for long-running events`,
        type: SettingsType.BOOLEAN,
        default: !ci_info_1.isCI && process.stdout.isTTY && process.stdout.columns > 22,
        defaultText: `<dynamic>`,
    },
    enableTimers: {
        description: `If true, the CLI is allowed to print the time spent executing commands`,
        type: SettingsType.BOOLEAN,
        default: true,
    },
    preferAggregateCacheInfo: {
        description: `If true, the CLI will only print a one-line report of any cache changes`,
        type: SettingsType.BOOLEAN,
        default: ci_info_1.isCI,
    },
    preferInteractive: {
        description: `If true, the CLI will automatically use the interactive mode when called from a TTY`,
        type: SettingsType.BOOLEAN,
        default: false,
    },
    preferTruncatedLines: {
        description: `If true, the CLI will truncate lines that would go beyond the size of the terminal`,
        type: SettingsType.BOOLEAN,
        default: false,
    },
    progressBarStyle: {
        description: `Which style of progress bar should be used (only when progress bars are enabled)`,
        type: SettingsType.STRING,
        default: undefined,
        defaultText: `<dynamic>`,
    },
    // Settings related to how packages are interpreted by default
    defaultLanguageName: {
        description: `Default language mode that should be used when a package doesn't offer any insight`,
        type: SettingsType.STRING,
        default: `node`,
    },
    defaultProtocol: {
        description: `Default resolution protocol used when resolving pure semver and tag ranges`,
        type: SettingsType.STRING,
        default: `npm:`,
    },
    enableTransparentWorkspaces: {
        description: `If false, Yarn won't automatically resolve workspace dependencies unless they use the \`workspace:\` protocol`,
        type: SettingsType.BOOLEAN,
        default: true,
    },
    // Settings related to network access
    enableMirror: {
        description: `If true, the downloaded packages will be retrieved and stored in both the local and global folders`,
        type: SettingsType.BOOLEAN,
        default: true,
    },
    enableNetwork: {
        description: `If false, the package manager will refuse to use the network if required to`,
        type: SettingsType.BOOLEAN,
        default: true,
    },
    httpProxy: {
        description: `URL of the http proxy that must be used for outgoing http requests`,
        type: SettingsType.STRING,
        default: null,
    },
    httpsProxy: {
        description: `URL of the http proxy that must be used for outgoing https requests`,
        type: SettingsType.STRING,
        default: null,
    },
    unsafeHttpWhitelist: {
        description: `List of the hostnames for which http queries are allowed (glob patterns are supported)`,
        type: SettingsType.STRING,
        default: [],
        isArray: true,
    },
    httpTimeout: {
        description: `Timeout of each http request in milliseconds`,
        type: SettingsType.NUMBER,
        default: 60000,
    },
    httpRetry: {
        description: `Retry times on http failure`,
        type: SettingsType.NUMBER,
        default: 3,
    },
    networkConcurrency: {
        description: `Maximal number of concurrent requests`,
        type: SettingsType.NUMBER,
        default: Infinity,
    },
    networkSettings: {
        description: `Network settings per hostname (glob patterns are supported)`,
        type: SettingsType.MAP,
        valueDefinition: {
            description: ``,
            type: SettingsType.SHAPE,
            properties: {
                caFilePath: {
                    description: `Path to file containing one or multiple Certificate Authority signing certificates`,
                    type: SettingsType.ABSOLUTE_PATH,
                    default: null,
                },
                enableNetwork: {
                    description: `If false, the package manager will refuse to use the network if required to`,
                    type: SettingsType.BOOLEAN,
                    default: null,
                },
                httpProxy: {
                    description: `URL of the http proxy that must be used for outgoing http requests`,
                    type: SettingsType.STRING,
                    default: null,
                },
                httpsProxy: {
                    description: `URL of the http proxy that must be used for outgoing https requests`,
                    type: SettingsType.STRING,
                    default: null,
                },
            },
        },
    },
    caFilePath: {
        description: `A path to a file containing one or multiple Certificate Authority signing certificates`,
        type: SettingsType.ABSOLUTE_PATH,
        default: null,
    },
    enableStrictSsl: {
        description: `If false, SSL certificate errors will be ignored`,
        type: SettingsType.BOOLEAN,
        default: true,
    },
    logFilters: {
        description: `Overrides for log levels`,
        type: SettingsType.SHAPE,
        isArray: true,
        concatenateValues: true,
        properties: {
            code: {
                description: `Code of the messages covered by this override`,
                type: SettingsType.STRING,
                default: undefined,
            },
            text: {
                description: `Code of the texts covered by this override`,
                type: SettingsType.STRING,
                default: undefined,
            },
            level: {
                description: `Log level override, set to null to remove override`,
                type: SettingsType.STRING,
                values: Object.values(formatUtils.LogLevel),
                isNullable: true,
                default: undefined,
            },
        },
    },
    // Settings related to telemetry
    enableTelemetry: {
        description: `If true, telemetry will be periodically sent, following the rules in https://yarnpkg.com/advanced/telemetry`,
        type: SettingsType.BOOLEAN,
        default: true,
    },
    telemetryInterval: {
        description: `Minimal amount of time between two telemetry uploads, in days`,
        type: SettingsType.NUMBER,
        default: 7,
    },
    telemetryUserId: {
        description: `If you desire to tell us which project you are, you can set this field. Completely optional and opt-in.`,
        type: SettingsType.STRING,
        default: null,
    },
    // Settings related to security
    enableScripts: {
        description: `If true, packages are allowed to have install scripts by default`,
        type: SettingsType.BOOLEAN,
        default: true,
    },
    enableImmutableCache: {
        description: `If true, the cache is reputed immutable and actions that would modify it will throw`,
        type: SettingsType.BOOLEAN,
        default: false,
    },
    checksumBehavior: {
        description: `Enumeration defining what to do when a checksum doesn't match expectations`,
        type: SettingsType.STRING,
        default: `throw`,
    },
    // Package patching - to fix incorrect definitions
    packageExtensions: {
        description: `Map of package corrections to apply on the dependency tree`,
        type: SettingsType.MAP,
        valueDefinition: {
            description: `The extension that will be applied to any package whose version matches the specified range`,
            type: SettingsType.SHAPE,
            properties: {
                dependencies: {
                    description: `The set of dependencies that must be made available to the current package in order for it to work properly`,
                    type: SettingsType.MAP,
                    valueDefinition: {
                        description: `A range`,
                        type: SettingsType.STRING,
                    },
                },
                peerDependencies: {
                    description: `Inherited dependencies - the consumer of the package will be tasked to provide them`,
                    type: SettingsType.MAP,
                    valueDefinition: {
                        description: `A semver range`,
                        type: SettingsType.STRING,
                    },
                },
                peerDependenciesMeta: {
                    description: `Extra information related to the dependencies listed in the peerDependencies field`,
                    type: SettingsType.MAP,
                    valueDefinition: {
                        description: `The peerDependency meta`,
                        type: SettingsType.SHAPE,
                        properties: {
                            optional: {
                                description: `If true, the selected peer dependency will be marked as optional by the package manager and the consumer omitting it won't be reported as an error`,
                                type: SettingsType.BOOLEAN,
                                default: false,
                            },
                        },
                    },
                },
            },
        },
    },
};
function parseValue(configuration, path, value, definition, folder) {
    if (definition.isArray) {
        if (!Array.isArray(value)) {
            return String(value).split(/,/).map(segment => {
                return parseSingleValue(configuration, path, segment, definition, folder);
            });
        }
        else {
            return value.map((sub, i) => parseSingleValue(configuration, `${path}[${i}]`, sub, definition, folder));
        }
    }
    else {
        if (Array.isArray(value)) {
            throw new Error(`Non-array configuration settings "${path}" cannot be an array`);
        }
        else {
            return parseSingleValue(configuration, path, value, definition, folder);
        }
    }
}
function parseSingleValue(configuration, path, value, definition, folder) {
    var _a;
    switch (definition.type) {
        case SettingsType.ANY:
            return value;
        case SettingsType.SHAPE:
            return parseShape(configuration, path, value, definition, folder);
        case SettingsType.MAP:
            return parseMap(configuration, path, value, definition, folder);
    }
    if (value === null && !definition.isNullable && definition.default !== null)
        throw new Error(`Non-nullable configuration settings "${path}" cannot be set to null`);
    if ((_a = definition.values) === null || _a === void 0 ? void 0 : _a.includes(value))
        return value;
    const interpretValue = () => {
        if (definition.type === SettingsType.BOOLEAN)
            return miscUtils.parseBoolean(value);
        if (typeof value !== `string`)
            throw new Error(`Expected value (${value}) to be a string`);
        const valueWithReplacedVariables = miscUtils.replaceEnvVariables(value, {
            env: process.env,
        });
        switch (definition.type) {
            case SettingsType.ABSOLUTE_PATH:
                return fslib_1.ppath.resolve(folder, fslib_1.npath.toPortablePath(valueWithReplacedVariables));
            case SettingsType.LOCATOR_LOOSE:
                return structUtils.parseLocator(valueWithReplacedVariables, false);
            case SettingsType.NUMBER:
                return parseInt(valueWithReplacedVariables);
            case SettingsType.LOCATOR:
                return structUtils.parseLocator(valueWithReplacedVariables);
            default:
                return valueWithReplacedVariables;
        }
    };
    const interpreted = interpretValue();
    if (definition.values && !definition.values.includes(interpreted))
        throw new Error(`Invalid value, expected one of ${definition.values.join(`, `)}`);
    return interpreted;
}
function parseShape(configuration, path, value, definition, folder) {
    if (typeof value !== `object` || Array.isArray(value))
        throw new clipanion_1.UsageError(`Object configuration settings "${path}" must be an object`);
    const result = getDefaultValue(configuration, definition, {
        ignoreArrays: true,
    });
    if (value === null)
        return result;
    for (const [propKey, propValue] of Object.entries(value)) {
        const subPath = `${path}.${propKey}`;
        const subDefinition = definition.properties[propKey];
        if (!subDefinition)
            throw new clipanion_1.UsageError(`Unrecognized configuration settings found: ${path}.${propKey} - run "yarn config -v" to see the list of settings supported in Yarn`);
        result.set(propKey, parseValue(configuration, subPath, propValue, definition.properties[propKey], folder));
    }
    return result;
}
function parseMap(configuration, path, value, definition, folder) {
    const result = new Map();
    if (typeof value !== `object` || Array.isArray(value))
        throw new clipanion_1.UsageError(`Map configuration settings "${path}" must be an object`);
    if (value === null)
        return result;
    for (const [propKey, propValue] of Object.entries(value)) {
        const normalizedKey = definition.normalizeKeys ? definition.normalizeKeys(propKey) : propKey;
        const subPath = `${path}['${normalizedKey}']`;
        // @ts-expect-error: SettingsDefinitionNoDefault has ... no default ... but
        // that's fine because we're guaranteed it's not undefined.
        const valueDefinition = definition.valueDefinition;
        result.set(normalizedKey, parseValue(configuration, subPath, propValue, valueDefinition, folder));
    }
    return result;
}
function getDefaultValue(configuration, definition, { ignoreArrays = false } = {}) {
    switch (definition.type) {
        case SettingsType.SHAPE:
            {
                if (definition.isArray && !ignoreArrays)
                    return [];
                const result = new Map();
                for (const [propKey, propDefinition] of Object.entries(definition.properties))
                    result.set(propKey, getDefaultValue(configuration, propDefinition));
                return result;
            }
            break;
        case SettingsType.MAP:
            {
                if (definition.isArray && !ignoreArrays)
                    return [];
                return new Map();
            }
            break;
        case SettingsType.ABSOLUTE_PATH:
            {
                if (definition.default === null)
                    return null;
                if (configuration.projectCwd === null) {
                    if (fslib_1.ppath.isAbsolute(definition.default)) {
                        return fslib_1.ppath.normalize(definition.default);
                    }
                    else if (definition.isNullable) {
                        return null;
                    }
                    else {
                        // Reached when a relative path is the default but the current
                        // context is evaluated outside of a Yarn project
                        return undefined;
                    }
                }
                else {
                    if (Array.isArray(definition.default)) {
                        return definition.default.map((entry) => fslib_1.ppath.resolve(configuration.projectCwd, entry));
                    }
                    else {
                        return fslib_1.ppath.resolve(configuration.projectCwd, definition.default);
                    }
                }
            }
            break;
        default:
            {
                return definition.default;
            }
            break;
    }
}
function transformConfiguration(rawValue, definition, transforms) {
    if (definition.type === SettingsType.SECRET && typeof rawValue === `string` && transforms.hideSecrets)
        return exports.SECRET;
    if (definition.type === SettingsType.ABSOLUTE_PATH && typeof rawValue === `string` && transforms.getNativePaths)
        return fslib_1.npath.fromPortablePath(rawValue);
    if (definition.isArray && Array.isArray(rawValue)) {
        const newValue = [];
        for (const value of rawValue)
            newValue.push(transformConfiguration(value, definition, transforms));
        return newValue;
    }
    if (definition.type === SettingsType.MAP && rawValue instanceof Map) {
        const newValue = new Map();
        for (const [key, value] of rawValue.entries())
            newValue.set(key, transformConfiguration(value, definition.valueDefinition, transforms));
        return newValue;
    }
    if (definition.type === SettingsType.SHAPE && rawValue instanceof Map) {
        const newValue = new Map();
        for (const [key, value] of rawValue.entries()) {
            const propertyDefinition = definition.properties[key];
            newValue.set(key, transformConfiguration(value, propertyDefinition, transforms));
        }
        return newValue;
    }
    return rawValue;
}
function getEnvironmentSettings() {
    const environmentSettings = {};
    for (let [key, value] of Object.entries(process.env)) {
        key = key.toLowerCase();
        if (!key.startsWith(exports.ENVIRONMENT_PREFIX))
            continue;
        key = camelcase_1.default(key.slice(exports.ENVIRONMENT_PREFIX.length));
        environmentSettings[key] = value;
    }
    return environmentSettings;
}
function getRcFilename() {
    const rcKey = `${exports.ENVIRONMENT_PREFIX}rc_filename`;
    for (const [key, value] of Object.entries(process.env))
        if (key.toLowerCase() === rcKey && typeof value === `string`)
            return value;
    return exports.DEFAULT_RC_FILENAME;
}
var ProjectLookup;
(function (ProjectLookup) {
    ProjectLookup[ProjectLookup["LOCKFILE"] = 0] = "LOCKFILE";
    ProjectLookup[ProjectLookup["MANIFEST"] = 1] = "MANIFEST";
    ProjectLookup[ProjectLookup["NONE"] = 2] = "NONE";
})(ProjectLookup = exports.ProjectLookup || (exports.ProjectLookup = {}));
class Configuration {
    constructor(startingCwd) {
        this.projectCwd = null;
        this.plugins = new Map();
        this.settings = new Map();
        this.values = new Map();
        this.sources = new Map();
        this.invalid = new Map();
        this.packageExtensions = new Map();
        this.limits = new Map();
        this.startingCwd = startingCwd;
    }
    static create(startingCwd, projectCwdOrPlugins, maybePlugins) {
        const configuration = new Configuration(startingCwd);
        if (typeof projectCwdOrPlugins !== `undefined` && !(projectCwdOrPlugins instanceof Map))
            configuration.projectCwd = projectCwdOrPlugins;
        configuration.importSettings(exports.coreDefinitions);
        const plugins = typeof maybePlugins !== `undefined`
            ? maybePlugins
            : projectCwdOrPlugins instanceof Map
                ? projectCwdOrPlugins
                : new Map();
        for (const [name, plugin] of plugins)
            configuration.activatePlugin(name, plugin);
        return configuration;
    }
    /**
     * Instantiate a new configuration object exposing the configuration obtained
     * from reading the various rc files and the environment settings.
     *
     * The `pluginConfiguration` parameter is expected to indicate:
     *
     * 1. which modules should be made available to plugins when they require a
     *    package (this is the dynamic linking part - for example we want all the
     *    plugins to use the exact same version of @yarnpkg/core, which also is the
     *    version used by the running Yarn instance).
     *
     * 2. which of those modules are actually plugins that need to be injected
     *    within the configuration.
     *
     * Note that some extra plugins will be automatically added based on the
     * content of the rc files - with the rc plugins taking precedence over
     * the other ones.
     *
     * One particularity: the plugin initialization order is quite strict, with
     * plugins listed in /foo/bar/.yarnrc.yml taking precedence over plugins
     * listed in /foo/.yarnrc.yml and /.yarnrc.yml. Additionally, while plugins
     * can depend on one another, they can only depend on plugins that have been
     * instantiated before them (so a plugin listed in /foo/.yarnrc.yml can
     * depend on another one listed on /foo/bar/.yarnrc.yml, but not the other
     * way around).
     */
    static async find(startingCwd, pluginConfiguration, { lookup = ProjectLookup.LOCKFILE, strict = true, usePath = false, useRc = true } = {}) {
        const environmentSettings = getEnvironmentSettings();
        delete environmentSettings.rcFilename;
        const rcFiles = await Configuration.findRcFiles(startingCwd);
        const homeRcFile = await Configuration.findHomeRcFile();
        const pickCoreFields = ({ ignoreCwd, yarnPath, ignorePath, lockfileFilename }) => ({ ignoreCwd, yarnPath, ignorePath, lockfileFilename });
        const excludeCoreFields = ({ ignoreCwd, yarnPath, ignorePath, lockfileFilename, ...rest }) => rest;
        const configuration = new Configuration(startingCwd);
        configuration.importSettings(pickCoreFields(exports.coreDefinitions));
        configuration.useWithSource(`<environment>`, pickCoreFields(environmentSettings), startingCwd, { strict: false });
        for (const { path, cwd, data } of rcFiles)
            configuration.useWithSource(path, pickCoreFields(data), cwd, { strict: false });
        if (homeRcFile)
            configuration.useWithSource(homeRcFile.path, pickCoreFields(homeRcFile.data), homeRcFile.cwd, { strict: false });
        if (usePath) {
            const yarnPath = configuration.get(`yarnPath`);
            const ignorePath = configuration.get(`ignorePath`);
            if (yarnPath !== null && !ignorePath) {
                return configuration;
            }
        }
        // We need to know the project root before being able to truly instantiate
        // our configuration, and to know that we need to know the lockfile name
        const lockfileFilename = configuration.get(`lockfileFilename`);
        let projectCwd;
        switch (lookup) {
            case ProjectLookup.LOCKFILE:
                {
                    projectCwd = await Configuration.findProjectCwd(startingCwd, lockfileFilename);
                }
                break;
            case ProjectLookup.MANIFEST:
                {
                    projectCwd = await Configuration.findProjectCwd(startingCwd, null);
                }
                break;
            case ProjectLookup.NONE:
                {
                    if (fslib_1.xfs.existsSync(fslib_1.ppath.join(startingCwd, `package.json`))) {
                        projectCwd = fslib_1.ppath.resolve(startingCwd);
                    }
                    else {
                        projectCwd = null;
                    }
                }
                break;
        }
        // Great! We now have enough information to really start to setup the
        // core configuration object.
        configuration.startingCwd = startingCwd;
        configuration.projectCwd = projectCwd;
        configuration.importSettings(excludeCoreFields(exports.coreDefinitions));
        // Now that the configuration object is almost ready, we need to load all
        // the configured plugins
        const plugins = new Map([
            [`@@core`, CorePlugin_1.CorePlugin],
        ]);
        const interop = (obj) => obj.__esModule
            ? obj.default
            : obj;
        if (pluginConfiguration !== null) {
            for (const request of pluginConfiguration.plugins.keys())
                plugins.set(request, interop(pluginConfiguration.modules.get(request)));
            const requireEntries = new Map();
            for (const request of nodeUtils.builtinModules())
                requireEntries.set(request, () => nodeUtils.dynamicRequire(request));
            for (const [request, embedModule] of pluginConfiguration.modules)
                requireEntries.set(request, () => embedModule);
            const dynamicPlugins = new Set();
            const getDefault = (object) => {
                return object.default || object;
            };
            const importPlugin = (pluginPath, source) => {
                const { factory, name } = nodeUtils.dynamicRequire(fslib_1.npath.fromPortablePath(pluginPath));
                // Prevent plugin redefinition so that the ones declared deeper in the
                // filesystem always have precedence over the ones below.
                if (dynamicPlugins.has(name))
                    return;
                const pluginRequireEntries = new Map(requireEntries);
                const pluginRequire = (request) => {
                    if (pluginRequireEntries.has(request)) {
                        return pluginRequireEntries.get(request)();
                    }
                    else {
                        throw new clipanion_1.UsageError(`This plugin cannot access the package referenced via ${request} which is neither a builtin, nor an exposed entry`);
                    }
                };
                const plugin = miscUtils.prettifySyncErrors(() => {
                    return getDefault(factory(pluginRequire));
                }, message => {
                    return `${message} (when initializing ${name}, defined in ${source})`;
                });
                requireEntries.set(name, () => plugin);
                dynamicPlugins.add(name);
                plugins.set(name, plugin);
            };
            if (environmentSettings.plugins) {
                for (const userProvidedPath of environmentSettings.plugins.split(`;`)) {
                    const pluginPath = fslib_1.ppath.resolve(startingCwd, fslib_1.npath.toPortablePath(userProvidedPath));
                    importPlugin(pluginPath, `<environment>`);
                }
            }
            for (const { path, cwd, data } of rcFiles) {
                if (!useRc)
                    continue;
                if (!Array.isArray(data.plugins))
                    continue;
                for (const userPluginEntry of data.plugins) {
                    const userProvidedPath = typeof userPluginEntry !== `string`
                        ? userPluginEntry.path
                        : userPluginEntry;
                    const pluginPath = fslib_1.ppath.resolve(cwd, fslib_1.npath.toPortablePath(userProvidedPath));
                    importPlugin(pluginPath, path);
                }
            }
        }
        for (const [name, plugin] of plugins)
            configuration.activatePlugin(name, plugin);
        configuration.useWithSource(`<environment>`, excludeCoreFields(environmentSettings), startingCwd, { strict });
        for (const { path, cwd, data } of rcFiles)
            configuration.useWithSource(path, excludeCoreFields(data), cwd, { strict });
        // The home configuration is never strict because it improves support for
        // multiple projects using different Yarn versions on the same machine
        if (homeRcFile)
            configuration.useWithSource(homeRcFile.path, excludeCoreFields(homeRcFile.data), homeRcFile.cwd, { strict: false });
        if (configuration.get(`enableGlobalCache`)) {
            configuration.values.set(`cacheFolder`, `${configuration.get(`globalFolder`)}/cache`);
            configuration.sources.set(`cacheFolder`, `<internal>`);
        }
        await configuration.refreshPackageExtensions();
        return configuration;
    }
    static async findRcFiles(startingCwd) {
        const rcFilename = getRcFilename();
        const rcFiles = [];
        let nextCwd = startingCwd;
        let currentCwd = null;
        while (nextCwd !== currentCwd) {
            currentCwd = nextCwd;
            const rcPath = fslib_1.ppath.join(currentCwd, rcFilename);
            if (fslib_1.xfs.existsSync(rcPath)) {
                const content = await fslib_1.xfs.readFilePromise(rcPath, `utf8`);
                let data;
                try {
                    data = parsers_1.parseSyml(content);
                }
                catch (error) {
                    let tip = ``;
                    if (content.match(/^\s+(?!-)[^:]+\s+\S+/m))
                        tip = ` (in particular, make sure you list the colons after each key name)`;
                    throw new clipanion_1.UsageError(`Parse error when loading ${rcPath}; please check it's proper Yaml${tip}`);
                }
                rcFiles.push({ path: rcPath, cwd: currentCwd, data });
            }
            nextCwd = fslib_1.ppath.dirname(currentCwd);
        }
        return rcFiles;
    }
    static async findHomeRcFile() {
        const rcFilename = getRcFilename();
        const homeFolder = folderUtils.getHomeFolder();
        const homeRcFilePath = fslib_1.ppath.join(homeFolder, rcFilename);
        if (fslib_1.xfs.existsSync(homeRcFilePath)) {
            const content = await fslib_1.xfs.readFilePromise(homeRcFilePath, `utf8`);
            const data = parsers_1.parseSyml(content);
            return { path: homeRcFilePath, cwd: homeFolder, data };
        }
        return null;
    }
    static async findProjectCwd(startingCwd, lockfileFilename) {
        let projectCwd = null;
        let nextCwd = startingCwd;
        let currentCwd = null;
        while (nextCwd !== currentCwd) {
            currentCwd = nextCwd;
            if (fslib_1.xfs.existsSync(fslib_1.ppath.join(currentCwd, `package.json`)))
                projectCwd = currentCwd;
            if (lockfileFilename !== null) {
                if (fslib_1.xfs.existsSync(fslib_1.ppath.join(currentCwd, lockfileFilename))) {
                    projectCwd = currentCwd;
                    break;
                }
            }
            else {
                if (projectCwd !== null) {
                    break;
                }
            }
            nextCwd = fslib_1.ppath.dirname(currentCwd);
        }
        return projectCwd;
    }
    static async updateConfiguration(cwd, patch) {
        const rcFilename = getRcFilename();
        const configurationPath = fslib_1.ppath.join(cwd, rcFilename);
        const current = fslib_1.xfs.existsSync(configurationPath)
            ? parsers_1.parseSyml(await fslib_1.xfs.readFilePromise(configurationPath, `utf8`))
            : {};
        let patched = false;
        let replacement;
        if (typeof patch === `function`) {
            try {
                replacement = patch(current);
            }
            catch (_a) {
                replacement = patch({});
            }
            if (replacement === current) {
                return;
            }
        }
        else {
            replacement = current;
            for (const key of Object.keys(patch)) {
                const currentValue = current[key];
                const patchField = patch[key];
                let nextValue;
                if (typeof patchField === `function`) {
                    try {
                        nextValue = patchField(currentValue);
                    }
                    catch (_b) {
                        nextValue = patchField(undefined);
                    }
                }
                else {
                    nextValue = patchField;
                }
                if (currentValue === nextValue)
                    continue;
                replacement[key] = nextValue;
                patched = true;
            }
            if (!patched) {
                return;
            }
        }
        await fslib_1.xfs.changeFilePromise(configurationPath, parsers_1.stringifySyml(replacement), {
            automaticNewlines: true,
        });
    }
    static async updateHomeConfiguration(patch) {
        const homeFolder = folderUtils.getHomeFolder();
        return await Configuration.updateConfiguration(homeFolder, patch);
    }
    activatePlugin(name, plugin) {
        this.plugins.set(name, plugin);
        if (typeof plugin.configuration !== `undefined`) {
            this.importSettings(plugin.configuration);
        }
    }
    importSettings(definitions) {
        for (const [name, definition] of Object.entries(definitions)) {
            if (definition == null)
                continue;
            if (this.settings.has(name))
                throw new Error(`Cannot redefine settings "${name}"`);
            this.settings.set(name, definition);
            this.values.set(name, getDefaultValue(this, definition));
        }
    }
    useWithSource(source, data, folder, opts) {
        try {
            this.use(source, data, folder, opts);
        }
        catch (error) {
            error.message += ` (in ${formatUtils.pretty(this, source, formatUtils.Type.PATH)})`;
            throw error;
        }
    }
    use(source, data, folder, { strict = true, overwrite = false } = {}) {
        for (const key of Object.keys(data)) {
            const value = data[key];
            if (typeof value === `undefined`)
                continue;
            // The plugins have already been loaded at this point
            if (key === `plugins`)
                continue;
            // Some environment variables should be ignored when applying the configuration
            if (source === `<environment>` && IGNORED_ENV_VARIABLES.has(key))
                continue;
            // It wouldn't make much sense, would it?
            if (key === `rcFilename`)
                throw new clipanion_1.UsageError(`The rcFilename settings can only be set via ${`${exports.ENVIRONMENT_PREFIX}RC_FILENAME`.toUpperCase()}, not via a rc file`);
            const definition = this.settings.get(key);
            if (!definition) {
                if (strict) {
                    throw new clipanion_1.UsageError(`Unrecognized or legacy configuration settings found: ${key} - run "yarn config -v" to see the list of settings supported in Yarn`);
                }
                else {
                    this.invalid.set(key, source);
                    continue;
                }
            }
            if (this.sources.has(key) && !(overwrite || definition.type === SettingsType.MAP || definition.isArray && definition.concatenateValues))
                continue;
            let parsed;
            try {
                parsed = parseValue(this, key, data[key], definition, folder);
            }
            catch (error) {
                error.message += ` in ${formatUtils.pretty(this, source, formatUtils.Type.PATH)}`;
                throw error;
            }
            if (definition.type === SettingsType.MAP) {
                const previousValue = this.values.get(key);
                this.values.set(key, new Map(overwrite
                    ? [...previousValue, ...parsed]
                    : [...parsed, ...previousValue]));
                this.sources.set(key, `${this.sources.get(key)}, ${source}`);
            }
            else if (definition.isArray && definition.concatenateValues) {
                const previousValue = this.values.get(key);
                this.values.set(key, overwrite
                    ? [...previousValue, ...parsed]
                    : [...parsed, ...previousValue]);
                this.sources.set(key, `${this.sources.get(key)}, ${source}`);
            }
            else {
                this.values.set(key, parsed);
                this.sources.set(key, source);
            }
        }
    }
    get(key) {
        if (!this.values.has(key))
            throw new Error(`Invalid configuration key "${key}"`);
        return this.values.get(key);
    }
    getSpecial(key, { hideSecrets = false, getNativePaths = false }) {
        const rawValue = this.get(key);
        const definition = this.settings.get(key);
        if (typeof definition === `undefined`)
            throw new clipanion_1.UsageError(`Couldn't find a configuration settings named "${key}"`);
        return transformConfiguration(rawValue, definition, {
            hideSecrets,
            getNativePaths,
        });
    }
    getSubprocessStreams(logFile, { header, prefix, report }) {
        let stdout;
        let stderr;
        const logStream = fslib_1.xfs.createWriteStream(logFile);
        if (this.get(`enableInlineBuilds`)) {
            const stdoutLineReporter = report.createStreamReporter(`${prefix} ${formatUtils.pretty(this, `STDOUT`, `green`)}`);
            const stderrLineReporter = report.createStreamReporter(`${prefix} ${formatUtils.pretty(this, `STDERR`, `red`)}`);
            stdout = new stream_1.PassThrough();
            stdout.pipe(stdoutLineReporter);
            stdout.pipe(logStream);
            stderr = new stream_1.PassThrough();
            stderr.pipe(stderrLineReporter);
            stderr.pipe(logStream);
        }
        else {
            stdout = logStream;
            stderr = logStream;
            if (typeof header !== `undefined`) {
                stdout.write(`${header}\n`);
            }
        }
        return { stdout, stderr };
    }
    makeResolver() {
        const pluginResolvers = [];
        for (const plugin of this.plugins.values())
            for (const resolver of plugin.resolvers || [])
                pluginResolvers.push(new resolver());
        return new MultiResolver_1.MultiResolver([
            new VirtualResolver_1.VirtualResolver(),
            new WorkspaceResolver_1.WorkspaceResolver(),
            new ProtocolResolver_1.ProtocolResolver(),
            ...pluginResolvers,
        ]);
    }
    makeFetcher() {
        const pluginFetchers = [];
        for (const plugin of this.plugins.values())
            for (const fetcher of plugin.fetchers || [])
                pluginFetchers.push(new fetcher());
        return new MultiFetcher_1.MultiFetcher([
            new VirtualFetcher_1.VirtualFetcher(),
            new WorkspaceFetcher_1.WorkspaceFetcher(),
            ...pluginFetchers,
        ]);
    }
    getLinkers() {
        const linkers = [];
        for (const plugin of this.plugins.values())
            for (const linker of plugin.linkers || [])
                linkers.push(new linker());
        return linkers;
    }
    async refreshPackageExtensions() {
        this.packageExtensions = new Map();
        const packageExtensions = this.packageExtensions;
        const registerPackageExtension = (descriptor, extensionData, { userProvided = false } = {}) => {
            if (!semver_1.default.validRange(descriptor.range))
                throw new Error(`Only semver ranges are allowed as keys for the lockfileExtensions setting`);
            const extension = new Manifest_1.Manifest();
            extension.load(extensionData, { yamlCompatibilityMode: true });
            const extensionsPerIdent = miscUtils.getArrayWithDefault(packageExtensions, descriptor.identHash);
            const extensionsPerRange = [];
            extensionsPerIdent.push([descriptor.range, extensionsPerRange]);
            const baseExtension = {
                status: types_1.PackageExtensionStatus.Inactive,
                userProvided,
                parentDescriptor: descriptor,
            };
            for (const dependency of extension.dependencies.values())
                extensionsPerRange.push({ ...baseExtension, type: types_1.PackageExtensionType.Dependency, descriptor: dependency, description: `${structUtils.stringifyIdent(descriptor)} > ${structUtils.stringifyIdent(dependency)}` });
            for (const peerDependency of extension.peerDependencies.values())
                extensionsPerRange.push({ ...baseExtension, type: types_1.PackageExtensionType.PeerDependency, descriptor: peerDependency, description: `${structUtils.stringifyIdent(descriptor)} >> ${structUtils.stringifyIdent(peerDependency)}` });
            for (const [selector, meta] of extension.peerDependenciesMeta) {
                for (const [key, value] of Object.entries(meta)) {
                    extensionsPerRange.push({ ...baseExtension, type: types_1.PackageExtensionType.PeerDependencyMeta, selector, key: key, value, description: `${structUtils.stringifyIdent(descriptor)} >> ${selector} / ${key}` });
                }
            }
        };
        await this.triggerHook(hooks => {
            return hooks.registerPackageExtensions;
        }, this, registerPackageExtension);
        for (const [descriptorString, extensionData] of this.get(`packageExtensions`)) {
            registerPackageExtension(structUtils.parseDescriptor(descriptorString, true), miscUtils.convertMapsToIndexableObjects(extensionData), { userProvided: true });
        }
    }
    normalizePackage(original) {
        const pkg = structUtils.copyPackage(original);
        // We use the extensions to define additional dependencies that weren't
        // properly listed in the original package definition
        if (this.packageExtensions == null)
            throw new Error(`refreshPackageExtensions has to be called before normalizing packages`);
        const extensionsPerIdent = this.packageExtensions.get(original.identHash);
        if (typeof extensionsPerIdent !== `undefined`) {
            const version = original.version;
            if (version !== null) {
                for (const [range, extensionsPerRange] of extensionsPerIdent) {
                    if (!semverUtils.satisfiesWithPrereleases(version, range))
                        continue;
                    for (const extension of extensionsPerRange) {
                        // If an extension is active for a package but redundant
                        // for another one, it should be considered active
                        if (extension.status === types_1.PackageExtensionStatus.Inactive)
                            extension.status = types_1.PackageExtensionStatus.Redundant;
                        switch (extension.type) {
                            case types_1.PackageExtensionType.Dependency:
                                {
                                    const currentDependency = pkg.dependencies.get(extension.descriptor.identHash);
                                    if (typeof currentDependency === `undefined`) {
                                        extension.status = types_1.PackageExtensionStatus.Active;
                                        pkg.dependencies.set(extension.descriptor.identHash, extension.descriptor);
                                    }
                                }
                                break;
                            case types_1.PackageExtensionType.PeerDependency:
                                {
                                    const currentPeerDependency = pkg.peerDependencies.get(extension.descriptor.identHash);
                                    if (typeof currentPeerDependency === `undefined`) {
                                        extension.status = types_1.PackageExtensionStatus.Active;
                                        pkg.peerDependencies.set(extension.descriptor.identHash, extension.descriptor);
                                    }
                                }
                                break;
                            case types_1.PackageExtensionType.PeerDependencyMeta:
                                {
                                    const currentPeerDependencyMeta = pkg.peerDependenciesMeta.get(extension.selector);
                                    if (typeof currentPeerDependencyMeta === `undefined` || !Object.prototype.hasOwnProperty.call(currentPeerDependencyMeta, extension.key) || currentPeerDependencyMeta[extension.key] !== extension.value) {
                                        extension.status = types_1.PackageExtensionStatus.Active;
                                        miscUtils.getFactoryWithDefault(pkg.peerDependenciesMeta, extension.selector, () => ({}))[extension.key] = extension.value;
                                    }
                                }
                                break;
                            default:
                                {
                                    miscUtils.assertNever(extension);
                                }
                                break;
                        }
                    }
                }
            }
        }
        // We also add implicit optional @types peer dependencies for each peer
        // dependency. This is for compatibility reason, as many existing packages
        // forget to define their @types/react optional peer dependency when they
        // peer-depend on react.
        const getTypesName = (descriptor) => {
            return descriptor.scope
                ? `${descriptor.scope}__${descriptor.name}`
                : `${descriptor.name}`;
        };
        for (const descriptor of pkg.peerDependencies.values()) {
            if (descriptor.scope === `@types`)
                continue;
            const typesName = getTypesName(descriptor);
            const typesIdent = structUtils.makeIdent(`types`, typesName);
            if (pkg.peerDependencies.has(typesIdent.identHash) || pkg.peerDependenciesMeta.has(typesIdent.identHash))
                continue;
            pkg.peerDependenciesMeta.set(structUtils.stringifyIdent(typesIdent), {
                optional: true,
            });
        }
        // I don't like implicit dependencies, but package authors are reluctant to
        // use optional peer dependencies because they would print warnings in older
        // npm releases.
        for (const identString of pkg.peerDependenciesMeta.keys()) {
            const ident = structUtils.parseIdent(identString);
            if (!pkg.peerDependencies.has(ident.identHash)) {
                pkg.peerDependencies.set(ident.identHash, structUtils.makeDescriptor(ident, `*`));
            }
        }
        // We sort the dependencies so that further iterations always occur in the
        // same order, regardless how the various registries formatted their output
        pkg.dependencies = new Map(miscUtils.sortMap(pkg.dependencies, ([, descriptor]) => structUtils.stringifyDescriptor(descriptor)));
        pkg.peerDependencies = new Map(miscUtils.sortMap(pkg.peerDependencies, ([, descriptor]) => structUtils.stringifyDescriptor(descriptor)));
        return pkg;
    }
    getLimit(key) {
        return miscUtils.getFactoryWithDefault(this.limits, key, () => {
            return p_limit_1.default(this.get(key));
        });
    }
    async triggerHook(get, ...args) {
        for (const plugin of this.plugins.values()) {
            const hooks = plugin.hooks;
            if (!hooks)
                continue;
            const hook = get(hooks);
            if (!hook)
                continue;
            await hook(...args);
        }
    }
    async triggerMultipleHooks(get, argsList) {
        for (const args of argsList) {
            await this.triggerHook(get, ...args);
        }
    }
    async reduceHook(get, initialValue, ...args) {
        let value = initialValue;
        for (const plugin of this.plugins.values()) {
            const hooks = plugin.hooks;
            if (!hooks)
                continue;
            const hook = get(hooks);
            if (!hook)
                continue;
            value = await hook(value, ...args);
        }
        return value;
    }
    async firstHook(get, ...args) {
        for (const plugin of this.plugins.values()) {
            const hooks = plugin.hooks;
            if (!hooks)
                continue;
            const hook = get(hooks);
            if (!hook)
                continue;
            const ret = await hook(...args);
            if (typeof ret !== `undefined`) {
                // @ts-expect-error
                return ret;
            }
        }
        return null;
    }
    /**
     * @deprecated Prefer using formatUtils.pretty instead, which is type-safe
     */
    format(value, formatType) {
        return formatUtils.pretty(this, value, formatType);
    }
}
exports.Configuration = Configuration;
Configuration.telemetry = null;
