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
        name: 'title',
        message: 'title: '
    },
    {
        type: 'input',
        name: 'description',
        message: 'description: '
    }
];
const template = `
import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  IThemeManager
} from '@jupyterlab/apputils';


/**
 * A plugin for the {{title}}
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '{{name}}:plugin',
  requires: [IThemeManager],
  activate: (app: JupyterFrontEnd, manager: IThemeManager) => {
    manager.register({
      name: '{{title}}',
      isLight: true,
      load: () => manager.loadCSS('{{name}}/index.css'),
      unload: () => Promise.resolve(undefined)
    });
  },
  autoStart: true
};


export default plugin;
`;
void inquirer.prompt(questions).then(answers => {
    const { name, title, description } = answers;
    const dest = path.resolve(path.join('.', name));
    if (fs.existsSync(dest)) {
        console.error('Package already exists: ', name);
        process.exit(1);
    }
    fs.copySync(path.resolve('.', 'packages', 'theme-light-extension'), dest);
    const jsonPath = path.join(dest, 'package.json');
    const data = utils.readJSONFile(jsonPath);
    data.name = name;
    data.description = description;
    utils.writePackageData(jsonPath, data);
    // update the urls in urls.css
    const filePath = path.resolve('.', name, 'style', 'urls.css');
    let text = fs.readFileSync(filePath, 'utf8');
    text = text.split('@jupyterlab/theme-light-extension').join(name);
    fs.writeFileSync(filePath, text, 'utf8');
    // remove lib, node_modules and static.
    ['lib', 'node_modules', 'static'].forEach(folder => {
        const folderPath = path.join('.', name, folder);
        if (fs.existsSync(folderPath)) {
            fs.removeSync(folderPath);
        }
    });
    const readme = `${name}\n${description}\n`;
    fs.writeFileSync(path.join('.', name, 'README.md'), readme, 'utf8');
    let src = template.split('{{name}}').join(name);
    src = src.split('{{title}}').join(title);
    fs.writeFileSync(path.join('.', name, 'src', 'index.ts'), src, 'utf8');
    // Signify successful complation.
    console.debug(`Created new theme ${name}`);
});
//# sourceMappingURL=create-theme.js.map