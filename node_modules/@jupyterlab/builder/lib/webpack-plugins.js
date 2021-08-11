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
exports.WPPlugin = void 0;
const duplicate_package_checker_webpack_plugin_1 = __importDefault(require("duplicate-package-checker-webpack-plugin"));
const fs = __importStar(require("fs-extra"));
const license_webpack_plugin_1 = require("license-webpack-plugin");
// From
// https://github.com/webpack/webpack/blob/95120bdf98a01649740b104bebc426b0123651ce/lib/WatchIgnorePlugin.js
const IGNORE_TIME_ENTRY = 'ignore';
var WPPlugin;
(function (WPPlugin) {
    /**
     * A WebPack Plugin that copies the assets to the static directory
     */
    class FrontEndPlugin {
        constructor(buildDir, staticDir) {
            this.buildDir = buildDir;
            this.staticDir = staticDir;
            this._first = true;
        }
        apply(compiler) {
            compiler.hooks.afterEmit.tap('FrontEndPlugin', () => {
                // bail if no staticDir
                if (!this.staticDir) {
                    return;
                }
                // ensure a clean static directory on the first emit
                if (this._first && fs.existsSync(this.staticDir)) {
                    fs.removeSync(this.staticDir);
                }
                this._first = false;
                fs.copySync(this.buildDir, this.staticDir);
            });
        }
    }
    WPPlugin.FrontEndPlugin = FrontEndPlugin;
    /**
     * A helper class for the WatchIgnoreFilterPlugin. This is a close copy of
     * (the non-exported) webpack.IgnoringWatchFileSystem
     */
    class FilterIgnoringWatchFileSystem {
        constructor(wfs, ignored) {
            this.wfs = wfs;
            // ignored should be a callback function that filters the build files
            this.ignored = ignored;
        }
        watch(files, dirs, missing, startTime, options, callback, callbackUndelayed) {
            files = Array.from(files);
            dirs = Array.from(dirs);
            const notIgnored = (path) => !this.ignored(path);
            const ignoredFiles = files.filter(this.ignored);
            const ignoredDirs = dirs.filter(this.ignored);
            const watcher = this.wfs.watch(files.filter(notIgnored), dirs.filter(notIgnored), missing, startTime, options, (err, fileTimestamps, dirTimestamps, changedFiles, removedFiles) => {
                if (err)
                    return callback(err);
                for (const path of ignoredFiles) {
                    fileTimestamps.set(path, IGNORE_TIME_ENTRY);
                }
                for (const path of ignoredDirs) {
                    dirTimestamps.set(path, IGNORE_TIME_ENTRY);
                }
                callback(err, fileTimestamps, dirTimestamps, changedFiles, removedFiles);
            }, callbackUndelayed);
            return {
                close: () => watcher.close(),
                pause: () => watcher.pause(),
                getContextTimeInfoEntries: () => {
                    const dirTimestamps = watcher.getContextTimeInfoEntries();
                    for (const path of ignoredDirs) {
                        dirTimestamps.set(path, IGNORE_TIME_ENTRY);
                    }
                    return dirTimestamps;
                },
                getFileTimeInfoEntries: () => {
                    const fileTimestamps = watcher.getFileTimeInfoEntries();
                    for (const path of ignoredFiles) {
                        fileTimestamps.set(path, IGNORE_TIME_ENTRY);
                    }
                    return fileTimestamps;
                }
            };
        }
    }
    /**
     * A WebPack Plugin that ignores files files that are filtered
     * by a callback during a `--watch` build
     */
    class FilterWatchIgnorePlugin {
        constructor(ignored) {
            this.ignored = ignored;
        }
        apply(compiler) {
            compiler.hooks.afterEnvironment.tap('FilterWatchIgnorePlugin', () => {
                compiler.watchFileSystem = new FilterIgnoringWatchFileSystem(compiler.watchFileSystem, this.ignored);
            });
        }
    }
    WPPlugin.FilterWatchIgnorePlugin = FilterWatchIgnorePlugin;
    class NowatchDuplicatePackageCheckerPlugin extends duplicate_package_checker_webpack_plugin_1.default {
        apply(compiler) {
            const options = this.options;
            compiler.hooks.run.tap('NowatchDuplicatePackageCheckerPlugin', compiler => {
                const p = new duplicate_package_checker_webpack_plugin_1.default(options);
                p.apply(compiler);
            });
        }
    }
    WPPlugin.NowatchDuplicatePackageCheckerPlugin = NowatchDuplicatePackageCheckerPlugin;
    /**
     * A well-known filename for third-party license information.
     *
     * ### Note
     * If an alternate JupyterLab-based ecosystem wanted to implement a different
     * name, they may _still_ need to handle the presence of this file if reusing
     * any core files or extensions.
     *
     * If multiple files are found by `jupyterlab_server, their `packages` will
     * be concatenated.
     */
    WPPlugin.DEFAULT_LICENSE_REPORT_FILENAME = 'third-party-licenses.json';
    /**
     * a plugin that creates a predictable, machine-readable report of licenses for
     * all modules included in this build
     */
    class JSONLicenseWebpackPlugin extends license_webpack_plugin_1.LicenseWebpackPlugin {
        constructor(pluginOptions = {}) {
            super(Object.assign(Object.assign({ outputFilename: WPPlugin.DEFAULT_LICENSE_REPORT_FILENAME }, pluginOptions), { renderLicenses: modules => this.renderLicensesJSON(modules), perChunkOutput: false }));
        }
        /** render an SPDX-like record */
        renderLicensesJSON(modules) {
            const report = { packages: [] };
            modules.sort((left, right) => (left.name < right.name ? -1 : 1));
            for (const mod of modules) {
                report.packages.push({
                    name: mod.name || '',
                    versionInfo: mod.packageJson.version || '',
                    licenseId: mod.licenseId || '',
                    extractedText: mod.licenseText || ''
                });
            }
            return JSON.stringify(report, null, 2);
        }
    }
    WPPlugin.JSONLicenseWebpackPlugin = JSONLicenseWebpackPlugin;
})(WPPlugin = exports.WPPlugin || (exports.WPPlugin = {}));
//# sourceMappingURL=webpack-plugins.js.map