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
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
if (require.main === module) {
    // Make sure we have required command line arguments.
    if (process.argv.length !== 3) {
        const msg = '** Must supply a source package name\n';
        process.stderr.write(msg);
        process.exit(1);
    }
    let name = process.argv[2];
    const pkgPath = path.resolve(path.join('.', 'packages', name));
    if (!fs.existsSync(pkgPath)) {
        console.error('Package does not exist: ', name);
        process.exit(1);
    }
    const dest = path.resolve(`./tests/test-${name}`);
    if (fs.existsSync(dest)) {
        console.error('Test package already exists:', dest);
        process.exit(1);
    }
    fs.copySync(path.resolve(path.join(__dirname, '..', 'test-template')), dest);
    const jsonPath = path.join(dest, 'package.json');
    const data = utils.readJSONFile(jsonPath);
    if (name.indexOf('@jupyterlab/') === -1) {
        name = '@jupyterlab/test-' + name;
    }
    data.name = name;
    utils.writePackageData(jsonPath, data);
    fs.ensureDirSync(path.join(dest, 'src'));
}
//# sourceMappingURL=create-test-package.js.map