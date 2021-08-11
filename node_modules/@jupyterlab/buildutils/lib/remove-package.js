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
/**
 * Remove an extension from the relevant metadata
 * files of the JupyterLab source tree so that it
 * is not included in the build. Intended for testing
 * adding/removing extensions against development
 * branches of JupyterLab.
 */
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
// Make sure we have required command line arguments.
if (process.argv.length < 3) {
    const msg = '** Must supply a target extension name';
    process.stderr.write(msg);
    process.exit(1);
}
// Get the package name or path.
const target = process.argv[2];
const basePath = path.resolve('.');
// Get the package.json of the extension.
const packagePath = path.join(basePath, 'packages', target, 'package.json');
if (!fs.existsSync(packagePath)) {
    const msg = '** Absolute paths for packages are not allowed.';
    process.stderr.write(msg);
    process.exit(1);
}
// Remove the package from the local tree.
fs.removeSync(path.dirname(packagePath));
// Remove any dependencies on the package (will also run `jlpm integrity`)
utils.run(`jlpm remove:dependency ${target}`);
//# sourceMappingURL=remove-package.js.map