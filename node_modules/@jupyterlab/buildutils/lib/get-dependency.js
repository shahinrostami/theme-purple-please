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
exports.getDependency = void 0;
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
const package_json_1 = __importDefault(require("package-json"));
let allDeps = [];
let allDevDeps = [];
/**
 * Get the appropriate dependency for a given package name.
 *
 * @param name - The name of the package.
 *
 * @returns The dependency version specifier.
 */
async function getDependency(name) {
    let version = '';
    const versions = {};
    allDeps = [];
    allDevDeps = [];
    utils.getLernaPaths().forEach(pkgRoot => {
        // Read in the package.json.
        const packagePath = path.join(pkgRoot, 'package.json');
        let data;
        try {
            data = utils.readJSONFile(packagePath);
        }
        catch (e) {
            return;
        }
        if (data.name === name) {
            version = '^' + data.version;
            return;
        }
        const deps = data.dependencies || {};
        const devDeps = data.devDependencies || {};
        if (deps[name]) {
            allDeps.push(data.name);
            if (deps[name] in versions) {
                versions[deps[name]]++;
            }
            else {
                versions[deps[name]] = 1;
            }
        }
        if (devDeps[name]) {
            allDevDeps.push(data.name);
            if (devDeps[name] in versions) {
                versions[devDeps[name]]++;
            }
            else {
                versions[devDeps[name]] = 1;
            }
        }
    });
    if (version) {
        return version;
    }
    if (Object.keys(versions).length > 0) {
        // Get the most common version.
        version = Object.keys(versions).reduce((a, b) => {
            return versions[a] > versions[b] ? a : b;
        });
    }
    else {
        const releaseData = await package_json_1.default(name);
        version = '~' + releaseData.version;
    }
    return Promise.resolve(version);
}
exports.getDependency = getDependency;
if (require.main === module) {
    // Make sure we have required command line arguments.
    if (process.argv.length < 3) {
        const msg = '** Must supply a target library name\n';
        process.stderr.write(msg);
        process.exit(1);
    }
    const name = process.argv[2];
    void getDependency(name).then(version => {
        console.debug('dependency of: ', allDeps);
        console.debug('devDependency of:', allDevDeps);
        console.debug(`\n    "${name}": "${version}"`);
    });
}
//# sourceMappingURL=get-dependency.js.map