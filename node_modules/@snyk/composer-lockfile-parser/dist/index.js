"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const _isEmpty = require("lodash.isempty");
const path = require("path");
const errors_1 = require("./errors");
const file_parser_1 = require("./parsers/file-parser");
const composer_parser_1 = require("./parsers/composer-parser");
function buildDepTree(lockFileContent, manifestFileContent, defaultProjectName, systemVersions, includeDev = false) {
    const lockFileJson = file_parser_1.FileParser.parseLockFile(lockFileContent);
    const manifestJson = file_parser_1.FileParser.parseManifestFile(manifestFileContent);
    if (!lockFileJson.packages) {
        throw new errors_1.InvalidUserInputError('Invalid lock file. Must contain `packages` property');
    }
    const name = manifestJson.name || defaultProjectName;
    const version = composer_parser_1.ComposerParser.getVersion(manifestJson) || '0.0.0';
    const dependencies = composer_parser_1.ComposerParser.buildDependencies(manifestJson, lockFileJson, manifestJson, systemVersions, includeDev);
    const hasDevDependencies = !_isEmpty(manifestJson['require-dev']);
    return {
        name,
        version,
        dependencies,
        hasDevDependencies,
        packageFormatVersion: 'composer:0.0.1',
    };
}
exports.buildDepTree = buildDepTree;
function buildDepTreeFromFiles(basePath, lockFileName, systemVersions, includeDev = false) {
    if (!basePath) {
        throw new errors_1.InvalidUserInputError('Missing `basePath` parameter for buildDepTreeFromFiles()');
    }
    if (!lockFileName) {
        throw new errors_1.InvalidUserInputError('Missing `lockfile` parameter for buildDepTreeFromFiles()');
    }
    if (!systemVersions) {
        throw new errors_1.InvalidUserInputError('Missing `systemVersions` parameter for buildDepTreeFromFiles()');
    }
    const lockFilePath = path.resolve(basePath, lockFileName);
    const manifestFilePath = path.resolve(basePath, path.dirname(lockFilePath), 'composer.json');
    if (!fs.existsSync(lockFilePath)) {
        throw new errors_1.InvalidUserInputError(`Lockfile not found at location: ${lockFilePath}`);
    }
    if (!fs.existsSync(manifestFilePath)) {
        throw new errors_1.InvalidUserInputError(`Target file composer.json not found at location: ${manifestFilePath}`);
    }
    const lockFileContent = fs.readFileSync(lockFilePath, 'utf-8');
    const manifestFileContent = fs.readFileSync(manifestFilePath, 'utf-8');
    const defaultProjectName = getDefaultProjectName(basePath, lockFileName);
    return buildDepTree(lockFileContent, manifestFileContent, defaultProjectName, systemVersions, includeDev);
}
exports.buildDepTreeFromFiles = buildDepTreeFromFiles;
function getDefaultProjectName(basePath, lockFileName) {
    return path.dirname(path.resolve(path.join(basePath, lockFileName))).split(path.sep).pop();
}
//# sourceMappingURL=index.js.map