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
exports.handlePackage = void 0;
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
const package_json_1 = __importDefault(require("package-json"));
const commander_1 = __importDefault(require("commander"));
const semver_1 = __importDefault(require("semver"));
/**
 * Handle an individual package on the path - update the dependency.
 */
async function handlePackage(packagePath) {
    const cmds = [];
    // Read in the package.json.
    packagePath = path.join(packagePath, 'package.json');
    let data;
    try {
        data = utils.readJSONFile(packagePath);
    }
    catch (e) {
        console.debug('Skipping package ' + packagePath);
        return cmds;
    }
    if (data.private) {
        return cmds;
    }
    const pkg = data.name;
    const npmData = await package_json_1.default(pkg, { allVersions: true });
    const versions = Object.keys(npmData.versions).sort(semver_1.default.rcompare);
    const tags = npmData['dist-tags'];
    // Go through the versions. The latest prerelease is 'next', the latest
    // non-prerelease should be 'stable'.
    const next = semver_1.default.prerelease(versions[0]) ? versions[0] : undefined;
    const latest = versions.find(i => !semver_1.default.prerelease(i));
    if (latest && latest !== tags.latest) {
        cmds.push(`npm dist-tag add ${pkg}@${latest} latest`);
    }
    // If next is defined, but not supposed to be, remove it. If next is supposed
    // to be defined, but is not the same as the current next, change it.
    if (!next && tags.next) {
        cmds.push(`npm dist-tag rm ${pkg} next`);
    }
    else if (next && next !== tags.next) {
        cmds.push(`npm dist-tag add ${pkg}@${next} next`);
    }
    return cmds;
}
exports.handlePackage = handlePackage;
function flatten(a) {
    return a.reduce((acc, val) => acc.concat(val), []);
}
commander_1.default
    .description(`Print out commands to update npm 'latest' and 'next' dist-tags
so that 'latest' points to the latest stable release and 'next'
points to the latest prerelease after it.`)
    .option('--lerna', 'Update dist-tags in all lerna packages')
    .option('--path [path]', 'Path to package or monorepo to update')
    .action(async (args) => {
    const basePath = path.resolve(args.path || '.');
    let cmds = [];
    let paths = [];
    if (args.lerna) {
        paths = utils.getLernaPaths(basePath).sort();
        cmds = await Promise.all(paths.map(handlePackage));
    }
    cmds.push(await handlePackage(basePath));
    const out = flatten(cmds).join('\n');
    if (out) {
        console.debug(out);
    }
});
if (require.main === module) {
    commander_1.default.parse(process.argv);
}
//# sourceMappingURL=update-dist-tag.js.map