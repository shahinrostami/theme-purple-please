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
const inquirer = __importStar(require("inquirer"));
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
const questions = [
    {
        type: 'input',
        name: 'name',
        message: 'name: '
    },
    {
        type: 'input',
        name: 'description',
        message: 'description: '
    }
];
void inquirer.prompt(questions).then(answers => {
    let { name, description } = answers;
    const dest = path.resolve(path.join('.', 'packages', name));
    if (fs.existsSync(dest)) {
        console.error('Package already exists: ', name);
        process.exit(1);
    }
    fs.copySync(path.resolve(path.join(__dirname, '..', 'template')), dest);
    const jsonPath = path.join(dest, 'package.json');
    const data = utils.readJSONFile(jsonPath);
    if (name.indexOf('@jupyterlab/') === -1) {
        name = '@jupyterlab/' + name;
    }
    data.name = name;
    data.description = description;
    utils.writePackageData(jsonPath, data);
    // Add the launch file to git.
    const launch = path.join(dest, '.vscode', 'launch.json');
    utils.run(`git add -f ${launch}`);
    // Use npm here so this file can be used outside of JupyterLab.
    utils.run('npm run integrity');
});
//# sourceMappingURL=create-package.js.map