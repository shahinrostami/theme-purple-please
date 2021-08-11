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
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
// Make sure we have required command line arguments.
if (process.argv.length !== 3) {
    const msg = '** Must supply a library name\n';
    process.stderr.write(msg);
    process.exit(1);
}
const name = process.argv[2];
// Handle the packages
utils.getLernaPaths().forEach(pkgPath => {
    handlePackage(pkgPath);
});
handlePackage(path.resolve('.'));
/**
 * Handle an individual package on the path - update the dependency.
 */
function handlePackage(packagePath) {
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
        delete deps[name];
    }
    // Write the file back to disk.
    utils.writePackageData(packagePath, data);
}
// Update the core jupyterlab build dependencies.
utils.run('jlpm run integrity');
//# sourceMappingURL=remove-dependency.js.map