"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutOfSyncError = exports.inspect = void 0;
const tslib_1 = require("tslib");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const subProcess = require("./sub-process");
const cocoapods_lockfile_parser_1 = require("@snyk/cocoapods-lockfile-parser");
const legacy_1 = require("@snyk/dep-graph/dist/legacy");
// Compile-time check that we are implementing the plugin API properly
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ = {
    pluginName() {
        return "snyk-cocoapods-plugin";
    },
    inspect,
};
const MANIFEST_FILE_NAMES = [
    "CocoaPods.podfile.yaml",
    "CocoaPods.podfile",
    "Podfile",
    "Podfile.rb",
];
const LOCKFILE_NAME = "Podfile.lock";
function inspect(root, targetFile, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!options) {
            options = { dev: false };
        }
        if (!("strictOutOfSync" in options)) {
            options.strictOutOfSync = false;
        }
        if (options.subProject) {
            throw new Error("The CocoaPods plugin doesn't support specifying a subProject!");
        }
        let lockfilePath;
        function expectToFindLockfile(dir = '.') {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const discoveredLockfilePath = yield findLockfile(root, dir);
                if (!discoveredLockfilePath) {
                    throw new Error("Could not find lockfile \"Podfile.lock\"! This might be resolved by running `pod install`.");
                }
                return discoveredLockfilePath;
            });
        }
        let manifestFilePath;
        if (targetFile) {
            const { base, dir } = path.parse(targetFile);
            if (base === LOCKFILE_NAME) {
                lockfilePath = targetFile;
                manifestFilePath = yield findManifestFile(root, dir);
            }
            else if (MANIFEST_FILE_NAMES.indexOf(base) !== -1) {
                const absTargetFilePath = path.join(root, targetFile);
                if (!(yield fsExists(absTargetFilePath))) {
                    throw new Error(`Given target file ("${targetFile}") doesn't exist!`);
                }
                manifestFilePath = targetFile;
                lockfilePath = yield expectToFindLockfile(dir);
            }
            else {
                throw new Error("Unexpected name for target file!");
            }
        }
        else {
            manifestFilePath = yield findManifestFile(root);
            lockfilePath = yield expectToFindLockfile();
        }
        const absLockfilePath = path.join(root, lockfilePath);
        if (options.strictOutOfSync) {
            if (!manifestFilePath) {
                throw new Error("Option `--strict-out-of-sync=true` given, but no manifest file could be found!");
            }
            const absManifestFilePath = path.join(root, manifestFilePath);
            const result = yield verifyChecksum(absManifestFilePath, absLockfilePath);
            if (result === ChecksumVerificationResult.NoChecksumInLockfile) {
                throw new Error("Option `--strict-out-of-sync=true` given, but lockfile doesn't encode checksum of Podfile! "
                    + "Try to update the CocoaPods integration via \"pod install\" or omit the option.");
            }
            if (result === ChecksumVerificationResult.Invalid) {
                throw new OutOfSyncError(manifestFilePath, lockfilePath);
            }
        }
        const plugin = {
            meta: {},
            name: 'cocoapods',
            runtime: yield cocoapodsVersion(root),
            targetFile: manifestFilePath || lockfilePath,
        };
        const depTree = yield getAllDeps(absLockfilePath);
        return {
            package: depTree,
            plugin,
        };
    });
}
exports.inspect = inspect;
function fsExists(pathToTest) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            try {
                fs.exists(pathToTest, (exists) => resolve(exists));
            }
            catch (error) {
                reject(error);
            }
        });
    });
}
function fsReadFile(filename) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    });
}
function findManifestFile(root, dir = '.') {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const manifestFileName of MANIFEST_FILE_NAMES) {
            const targetFilePath = path.join(root, dir, manifestFileName);
            if (yield fsExists(targetFilePath)) {
                return path.join(dir, manifestFileName);
            }
        }
    });
}
function findLockfile(root, dir = '.') {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const lockfilePath = path.join(root, dir, LOCKFILE_NAME);
        if (yield fsExists(lockfilePath)) {
            return path.join(dir, LOCKFILE_NAME);
        }
    });
}
var ChecksumVerificationResult;
(function (ChecksumVerificationResult) {
    ChecksumVerificationResult[ChecksumVerificationResult["Valid"] = 0] = "Valid";
    ChecksumVerificationResult[ChecksumVerificationResult["Invalid"] = 1] = "Invalid";
    ChecksumVerificationResult[ChecksumVerificationResult["NoChecksumInLockfile"] = 2] = "NoChecksumInLockfile";
})(ChecksumVerificationResult || (ChecksumVerificationResult = {}));
function verifyChecksum(manifestFilePath, lockfilePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const manifestFileContents = yield fsReadFile(manifestFilePath);
        const checksum = crypto.createHash('sha1').update(manifestFileContents).digest('hex');
        const parser = yield cocoapods_lockfile_parser_1.LockfileParser.readFile(lockfilePath);
        if (parser.podfileChecksum === undefined) {
            return ChecksumVerificationResult.NoChecksumInLockfile;
        }
        else if (parser.podfileChecksum === checksum) {
            return ChecksumVerificationResult.Valid;
        }
        else {
            return ChecksumVerificationResult.Invalid;
        }
    });
}
function getAllDeps(lockfilePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let parser;
        try {
            parser = yield cocoapods_lockfile_parser_1.LockfileParser.readFile(lockfilePath);
        }
        catch (error) {
            throw new Error(`Error while parsing ${LOCKFILE_NAME}:\n${error.message}`);
        }
        const graph = parser.toDepGraph();
        return legacy_1.graphToDepTree(graph, "cocoapods");
    });
}
function cocoapodsVersion(root) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let podVersionOutput = '';
        try {
            // 1st: try to run CocoaPods via bundler
            podVersionOutput = yield subProcess.execute('bundle exec pod', ['--version'], { cwd: root });
        }
        catch (_a) {
            try {
                // 2nd: try to run CocoaPods directly
                podVersionOutput = yield subProcess.execute('pod', ['--version'], { cwd: root });
            }
            catch (_b) {
                // intentionally empty
            }
        }
        return podVersionOutput.trim();
    });
}
class OutOfSyncError extends Error {
    constructor(manifestFileName, lockfileName) {
        super(`Your Podfile ("${manifestFileName}") is not in sync ` +
            `with your lockfile ("${lockfileName}"). ` +
            `Please run "pod install" and try again.`);
        this.code = 422;
        this.name = 'OutOfSyncError';
        Error.captureStackTrace(this, OutOfSyncError);
    }
}
exports.OutOfSyncError = OutOfSyncError;
//# sourceMappingURL=index.js.map