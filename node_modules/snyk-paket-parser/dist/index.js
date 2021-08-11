"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lock_parser_1 = require("./lock-parser");
const dependencies_parser_1 = require("./dependencies-parser");
const path = require("path");
const fs = require("fs");
const errors_1 = require("./errors");
exports.InvalidUserInputError = errors_1.InvalidUserInputError;
exports.OutOfSyncError = errors_1.OutOfSyncError;
const DEV_GROUPS = ['build', 'test', 'tests'];
const SUPPORTED_SOURCES = ['nuget'];
const FREQUENCY_THRESHOLD = 100;
var DepType;
(function (DepType) {
    DepType["prod"] = "prod";
    DepType["dev"] = "dev";
})(DepType = exports.DepType || (exports.DepType = {}));
function buildDepTreeFromFiles(root, manifestFilePath, lockFilePath, includeDev = false, strict = true) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const manifestFileFullPath = path.resolve(root, manifestFilePath);
        const lockFileFullPath = path.resolve(root, lockFilePath);
        if (!fs.existsSync(manifestFileFullPath)) {
            throw new errors_1.InvalidUserInputError('Target file paket.dependencies not found at ' +
                `location: ${manifestFileFullPath}`);
        }
        if (!fs.existsSync(lockFileFullPath)) {
            throw new errors_1.InvalidUserInputError('Lockfile not found at location: ' +
                lockFileFullPath);
        }
        const manifestFileContents = fs.readFileSync(manifestFileFullPath, 'utf-8');
        const lockFileContents = fs.readFileSync(lockFileFullPath, 'utf-8');
        return {
            dependencies: yield buildDepTree(manifestFileContents, lockFileContents, includeDev, strict),
            name: path.basename(path.dirname(manifestFileFullPath)),
            version: '',
        };
    });
}
exports.buildDepTreeFromFiles = buildDepTreeFromFiles;
function buildDepTree(manifestFileContents, lockFileContents, includeDev = false, strict = true) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const manifestFile = dependencies_parser_1.parseDependenciesFile(manifestFileContents);
        const lockFile = lock_parser_1.parseLockFile(lockFileContents);
        const dependenciesMap = new Map();
        collectRootDeps(manifestFile, dependenciesMap);
        collectResolvedDeps(lockFile, dependenciesMap);
        for (const dep of dependenciesMap.values()) {
            if (dep.root) {
                calculateReferences(dep, dependenciesMap);
            }
        }
        const dependencies = {};
        for (const dep of dependenciesMap.values()) {
            if (dep.root && (includeDev || dep.depType === DepType.prod)) {
                if (strict && !dep.resolved) {
                    throw new errors_1.OutOfSyncError(dep.name);
                }
                dependencies[dep.name] = buildTreeFromList(dep, dependenciesMap);
                if (!dep.resolved) {
                    dependencies[dep.name].missingLockFileEntry = true;
                }
            }
        }
        const frequentSubTree = buildFrequentDepsSubtree(dependenciesMap);
        if (Object.keys(frequentSubTree.dependencies).length) {
            dependencies[frequentSubTree.name] = frequentSubTree;
        }
        return dependencies;
    });
}
function collectRootDeps(manifestFile, dependenciesMap) {
    for (const group of manifestFile) {
        const isDev = DEV_GROUPS.indexOf((group.name || '').toLowerCase()) !== -1;
        for (const dep of group.dependencies) {
            if (SUPPORTED_SOURCES.indexOf(dep.source.toLowerCase()) === -1) {
                continue;
            }
            const nugetDep = dep;
            if (!dependenciesMap.has(nugetDep.name.toLowerCase())) {
                dependenciesMap.set(nugetDep.name.toLowerCase(), {
                    name: nugetDep.name,
                    // Will be overwritten in `collectResolvedDeps`.
                    version: nugetDep.versionRange,
                    // Will be overwritten in `collectResolvedDeps`.
                    dependencies: [],
                    depType: isDev ? DepType.dev : DepType.prod,
                    root: true,
                    refs: 1,
                    // Will be overwritten in `collectResolvedDeps`.
                    resolved: false,
                });
            }
        }
    }
}
function collectResolvedDeps(lockFile, dependenciesMap) {
    for (const group of lockFile.groups) {
        const isDev = DEV_GROUPS.indexOf((group.name || '').toLowerCase()) !== -1;
        for (const dep of group.dependencies) {
            if (SUPPORTED_SOURCES.indexOf(dep.repository.toLowerCase()) === -1) {
                continue;
            }
            if (dependenciesMap.has(dep.name.toLowerCase())) {
                const rootDep = dependenciesMap.get(dep.name.toLowerCase());
                rootDep.version = dep.version;
                rootDep.dependencies = dep.dependencies.map((d) => d.name.toLowerCase());
                rootDep.resolved = true;
            }
            else {
                dependenciesMap.set(dep.name.toLowerCase(), {
                    name: dep.name,
                    version: dep.version,
                    dependencies: dep.dependencies.map((d) => d.name.toLowerCase()),
                    depType: isDev ? DepType.dev : DepType.prod,
                    root: false,
                    refs: 0,
                    resolved: true,
                });
            }
        }
    }
}
function calculateReferences(node, dependenciesMap) {
    for (const subName of node.dependencies) {
        const sub = dependenciesMap.get(subName);
        sub.refs += node.refs;
        // Do not propagate calculations if we already reach threshold for the node.
        if (sub.refs < FREQUENCY_THRESHOLD) {
            calculateReferences(sub, dependenciesMap);
        }
    }
}
function buildFrequentDepsSubtree(dependenciesMap) {
    const tree = {
        name: 'meta-common-packages',
        version: 'meta',
        dependencies: {},
    };
    getFrequentDependencies(dependenciesMap).forEach((listItem) => {
        const treeNode = buildTreeFromList(listItem, dependenciesMap);
        tree.dependencies[treeNode.name] = treeNode;
    });
    return tree;
}
function getFrequentDependencies(dependenciesMap) {
    const frequentDeps = [];
    for (const dep of dependenciesMap.values()) {
        if (!dep.root && dep.refs >= FREQUENCY_THRESHOLD) {
            frequentDeps.push(dep);
        }
    }
    return frequentDeps;
}
function buildTreeFromList(listItem, dependenciesMap) {
    const tree = {
        name: listItem.name,
        version: listItem.version,
        dependencies: {},
        depType: listItem.depType,
    };
    for (const name of listItem.dependencies) {
        const subListItem = dependenciesMap.get(name);
        if (!(subListItem.refs >= FREQUENCY_THRESHOLD)) {
            const subtree = buildTreeFromList(subListItem, dependenciesMap);
            tree.dependencies[subtree.name] = subtree;
        }
    }
    return tree;
}
//# sourceMappingURL=index.js.map