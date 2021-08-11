"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const baseDebug = require("debug");
const debug = baseDebug('snyk-test');
const path = require("path");
const spinner = require("../../spinner");
const analytics = require("../../analytics");
const fs = require("fs");
const lockFileParser = require("snyk-nodejs-lockfile-parser");
async function parse(root, targetFile, options) {
    const lockFileFullPath = path.resolve(root, targetFile);
    if (!fs.existsSync(lockFileFullPath)) {
        throw new Error('Lockfile ' + targetFile + ' not found at location: ' + lockFileFullPath);
    }
    const fullPath = path.parse(lockFileFullPath);
    const manifestFileFullPath = path.resolve(fullPath.dir, 'package.json');
    const shrinkwrapFullPath = path.resolve(fullPath.dir, 'npm-shrinkwrap.json');
    if (!fs.existsSync(manifestFileFullPath)) {
        throw new Error(`Could not find package.json at ${manifestFileFullPath} ` +
            `(lockfile found at ${targetFile})`);
    }
    if (fs.existsSync(shrinkwrapFullPath)) {
        throw new Error('Both `npm-shrinkwrap.json` and `package-lock.json` were found in ' +
            fullPath.dir +
            '.\n' +
            'Please run your command again specifying `--file=package.json` flag.');
    }
    analytics.add('local', true);
    analytics.add('generating-node-dependency-tree', {
        lockFile: true,
        targetFile,
    });
    const resolveModuleSpinnerLabel = `Analyzing npm dependencies for ${lockFileFullPath}`;
    debug(resolveModuleSpinnerLabel);
    try {
        await spinner(resolveModuleSpinnerLabel);
        const strictOutOfSync = options.strictOutOfSync !== false;
        return lockFileParser.buildDepTreeFromFiles(root, manifestFileFullPath, lockFileFullPath, options.dev, strictOutOfSync);
    }
    finally {
        await spinner.clear(resolveModuleSpinnerLabel)();
    }
}
exports.parse = parse;
//# sourceMappingURL=npm-lock-parser.js.map