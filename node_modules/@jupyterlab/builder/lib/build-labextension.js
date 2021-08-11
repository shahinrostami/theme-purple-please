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
// Build an extension
// Inputs:
// Path to extension (required)
// Dev vs prod (dev is default)
// Output path (defaults to <extension>/build)
// Outputs
// Webpack build assets
///////////////////////////////////////////////////////
// Portions of the below code handling watch mode and displaying output were
// adapted from the https://github.com/webpack/webpack-cli project, which has
// an MIT license (https://github.com/webpack/webpack-cli/blob/4dc6dfbf29da16e61745770f7b48638963fb05c5/LICENSE):
//
// Copyright JS Foundation and other contributors
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
///////////////////////////////////////////////////////
const path = __importStar(require("path"));
const commander_1 = __importDefault(require("commander"));
const webpack_1 = __importDefault(require("webpack"));
const extensionConfig_1 = __importDefault(require("./extensionConfig"));
const supports_color_1 = require("supports-color");
commander_1.default
    .description('Build an extension')
    .option('--development', 'build in development mode (implies --source-map)')
    .option('--source-map', 'generate source maps')
    .requiredOption('--core-path <path>', 'the core package directory')
    .option('--static-url <url>', 'url for build assets, if hosted outside the built extension')
    .option('--watch')
    .action(async (cmd) => {
    const mode = cmd.development ? 'development' : 'production';
    const corePath = path.resolve(cmd.corePath || process.cwd());
    const packagePath = path.resolve(cmd.args[0]);
    const devtool = cmd.sourceMap ? 'source-map' : undefined;
    const config = extensionConfig_1.default({
        packagePath,
        mode,
        corePath,
        staticUrl: cmd.staticUrl,
        devtool,
        watchMode: cmd.watch
    });
    const compiler = webpack_1.default(config);
    let lastHash = null;
    function compilerCallback(err, stats) {
        if (!cmd.watch || err) {
            // Do not keep cache anymore
            compiler.purgeInputFileSystem();
        }
        if (err) {
            console.error(err.stack || err);
            if (err.details) {
                console.error(err.details);
            }
            throw new Error(err.details);
        }
        const info = stats.toJson();
        if (stats.hasErrors()) {
            console.error(info.errors);
            if (!cmd.watch) {
                process.exit(2);
            }
        }
        if (stats.hash !== lastHash) {
            lastHash = stats.hash;
            const statsString = stats.toString({ colors: supports_color_1.stdout });
            const delimiter = '';
            if (statsString) {
                process.stdout.write(`${statsString}\n${delimiter}`);
            }
        }
    }
    if (cmd.watch) {
        compiler.hooks.watchRun.tap('WebpackInfo', () => {
            console.error('\nWatch Compilation starting…\n');
        });
        compiler.hooks.done.tap('WebpackInfo', () => {
            console.error('\nWatch Compilation finished\n');
        });
    }
    else {
        compiler.hooks.run.tap('WebpackInfo', () => {
            console.error('\nCompilation starting…\n');
        });
        compiler.hooks.done.tap('WebpackInfo', () => {
            console.error('\nCompilation finished\n');
        });
    }
    if (cmd.watch) {
        compiler.watch(config[0].watchOptions || {}, compilerCallback);
        console.error('\nwebpack is watching the files…\n');
    }
    else {
        compiler.run((err, stats) => {
            if (compiler.close) {
                compiler.close((err2) => {
                    compilerCallback(err || err2, stats);
                });
            }
            else {
                compilerCallback(err, stats);
            }
        });
    }
});
commander_1.default.parse(process.argv);
// If no arguments supplied
if (!process.argv.slice(2).length) {
    commander_1.default.outputHelp();
    process.exit(1);
}
//# sourceMappingURL=build-labextension.js.map