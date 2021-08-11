#!/usr/bin/env node
"use strict";
/* -----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
const package_json_1 = __importDefault(require("package-json"));
const commander_1 = __importDefault(require("commander"));
const semver_1 = __importDefault(require("semver"));
const versionCache = new Map();
/**
 * Matches a simple semver range, where the version number could be an npm tag.
 */
const SEMVER_RANGE = /^(~|\^|=|<|>|<=|>=)?([\w\-.]*)$/;
/**
 * Get the specifier we should use
 *
 * @param currentSpecifier - The current package version.
 * @param suggestedSpecifier - The package version we would like to use.
 *
 * #### Notes
 * If the suggested specifier is not a valid range, we assume it is of the
 * form ${RANGE}${TAG}, where TAG is an npm tag (such as 'latest') and RANGE
 * is either a semver range indicator (one of `~, ^, >, <, =, >=, <=`), or is
 * not given (in which case the current specifier range prefix is used).
 */
async function getSpecifier(currentSpecifier, suggestedSpecifier) {
    var _a;
    if (semver_1.default.validRange(suggestedSpecifier)) {
        return suggestedSpecifier;
    }
    // The suggested specifier is not a valid range, so we assume it
    // references a tag
    let [, suggestedSigil, suggestedTag] = (_a = suggestedSpecifier.match(SEMVER_RANGE)) !== null && _a !== void 0 ? _a : [];
    if (!suggestedTag) {
        throw Error(`Invalid version specifier: ${suggestedSpecifier}`);
    }
    // A tag with no sigil adopts the sigil from the current specification
    if (!suggestedSigil) {
        const match = currentSpecifier.match(SEMVER_RANGE);
        if (match === null) {
            throw Error(`Current version range is not recognized: ${currentSpecifier}`);
        }
        suggestedSigil = match[1];
    }
    return `${suggestedSigil !== null && suggestedSigil !== void 0 ? suggestedSigil : ''}${suggestedTag}`;
}
async function getVersion(pkg, specifier) {
    var _a;
    const key = JSON.stringify([pkg, specifier]);
    if (versionCache.has(key)) {
        return versionCache.get(key);
    }
    if (semver_1.default.validRange(specifier) === null) {
        // We have a tag, with possibly a range specifier, such as ^latest
        const match = specifier.match(SEMVER_RANGE);
        if (match === null) {
            throw Error(`Invalid version specifier: ${specifier}`);
        }
        // Look up the actual version corresponding to the tag
        const { version } = await package_json_1.default(pkg, { version: match[2] });
        specifier = `${(_a = match[1]) !== null && _a !== void 0 ? _a : ''}${version}`;
        if (semver_1.default.validRange(specifier) === null) {
            throw Error(`Could not find valid version range for ${pkg}: ${specifier}`);
        }
    }
    versionCache.set(key, specifier);
    return specifier;
}
/**
 * A very simple subset comparator
 *
 * @returns true if we can determine if range1 is a subset of range2, otherwise false
 *
 * #### Notes
 * This will not be able to determine if range1 is a subset of range2 in many cases.
 */
function subset(range1, range2) {
    var _a, _b;
    try {
        const [, r1, version1] = (_a = range1.match(SEMVER_RANGE)) !== null && _a !== void 0 ? _a : [];
        const [, r2] = (_b = range2.match(SEMVER_RANGE)) !== null && _b !== void 0 ? _b : [];
        return (['', '>=', '=', '~', '^'].includes(r1) &&
            r1 === r2 &&
            !!semver_1.default.valid(version1) &&
            semver_1.default.satisfies(version1, range2));
    }
    catch (e) {
        return false;
    }
}
async function handleDependency(dependencies, dep, suggestedSpecifier, minimal) {
    const log = [];
    let updated = false;
    const oldRange = dependencies[dep];
    const specifier = await getSpecifier(oldRange, suggestedSpecifier);
    const newRange = await getVersion(dep, specifier);
    if (minimal && subset(newRange, oldRange)) {
        log.push(`SKIPPING ${dep} ${oldRange} -> ${newRange}`);
    }
    else {
        log.push(`${dep} ${oldRange} -> ${newRange}`);
        dependencies[dep] = newRange;
        updated = true;
    }
    return { updated, log };
}
/**
 * Handle an individual package on the path - update the dependency.
 */
async function handlePackage(name, specifier, packagePath, dryRun = false, minimal = false) {
    let fileUpdated = false;
    const fileLog = [];
    // Read in the package.json.
    packagePath = path.join(packagePath, 'package.json');
    let data;
    try {
        data = utils.readJSONFile(packagePath);
    }
    catch (e) {
        console.debug('Skipping package ' + packagePath);
        return;
    }
    // Update dependencies as appropriate.
    for (const dtype of ['dependencies', 'devDependencies']) {
        const deps = data[dtype] || {};
        if (typeof name === 'string') {
            const dep = name;
            if (dep in deps) {
                const { updated, log } = await handleDependency(deps, dep, specifier, minimal);
                if (updated) {
                    fileUpdated = true;
                }
                fileLog.push(...log);
            }
        }
        else {
            const keys = Object.keys(deps);
            keys.sort();
            for (const dep of keys) {
                if (dep.match(name)) {
                    const { updated, log } = await handleDependency(deps, dep, specifier, minimal);
                    if (updated) {
                        fileUpdated = true;
                    }
                    fileLog.push(...log);
                }
            }
        }
    }
    if (fileLog.length > 0) {
        console.debug(packagePath);
        console.debug(fileLog.join('\n'));
        console.debug();
    }
    // Write the file back to disk.
    if (!dryRun && fileUpdated) {
        utils.writePackageData(packagePath, data);
    }
}
commander_1.default
    .description('Update dependency versions')
    .usage('[options] <package> [versionspec], versionspec defaults to ^latest')
    .option('--dry-run', 'Do not perform actions, just print output')
    .option('--regex', 'Package is a regular expression')
    .option('--lerna', 'Update dependencies in all lerna packages')
    .option('--path <path>', 'Path to package or monorepo to update')
    .option('--minimal', 'only update if the change is substantial')
    .arguments('<package> [versionspec]')
    .action(async (name, version = '^latest', args) => {
    const basePath = path.resolve(args.path || '.');
    const pkg = args.regex ? new RegExp(name) : name;
    if (args.lerna) {
        const paths = utils.getLernaPaths(basePath).sort();
        // We use a loop instead of Promise.all so that the output is in
        // alphabetical order.
        for (const pkgPath of paths) {
            await handlePackage(pkg, version, pkgPath, args.dryRun, args.minimal);
        }
    }
    await handlePackage(pkg, version, basePath, args.dryRun, args.minimal);
});
commander_1.default.on('--help', function () {
    console.debug(`
Examples
--------

  Update the package 'webpack' to a specific version range:

      update-dependency webpack ^4.0.0

  Update all packages to the latest version, with a caret.
  Only update if the update is substantial:

      update-dependency --minimal --regex '.*' ^latest

  Update all packages, that does not start with '@jupyterlab',
  to the latest version and use the same version specifier currently
  being used

      update:dependency --regex '^(?!@jupyterlab).*' latest --dry-run

  Print the log of the above without actually making any changes.

  update-dependency --dry-run --minimal --regex '.*' ^latest

  Update all packages starting with '@jupyterlab/' to the version
  the 'latest' tag currently points to, with a caret range:

      update-dependency --regex '^@jupyterlab/' ^latest

  Update all packages starting with '@jupyterlab/' in all lerna
  workspaces and the root package.json to whatever version the 'next'
  tag for each package currently points to (with a caret tag).
  Update the version range only if the change is substantial.

      update-dependency --lerna --regex --minimal '^@jupyterlab/' ^next
`);
});
commander_1.default.parse(process.argv);
// If no arguments supplied
if (!process.argv.slice(2).length) {
    commander_1.default.outputHelp();
    process.exit(1);
}
//# sourceMappingURL=update-dependency.js.map