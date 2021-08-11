"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const dep_graph_1 = require("@snyk/dep-graph");
const utils_1 = require("./utils");
class LockfileParser {
    constructor(hash, rootPkgInfo) {
        this.rootPkgInfo = undefined;
        this.rootPkgInfo = rootPkgInfo;
        this.internalData = hash;
    }
    static async readFile(lockfilePath) {
        const rootName = path.basename(path.dirname(path.resolve(lockfilePath)));
        return new Promise((resolve, reject) => {
            fs.readFile(lockfilePath, { encoding: 'utf8' }, (err, fileContents) => {
                if (err) {
                    reject(err);
                }
                try {
                    const parser = this.readContents(fileContents, {
                        name: rootName,
                        version: '0.0.0',
                    });
                    resolve(parser);
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    }
    static readFileSync(lockfilePath) {
        const fileContents = fs.readFileSync(lockfilePath, 'utf8');
        const rootName = path.basename(path.dirname(path.resolve(lockfilePath)));
        return this.readContents(fileContents, {
            name: rootName,
            version: '0.0.0',
        });
    }
    static readContents(contents, rootPkgInfo) {
        return new LockfileParser(yaml.safeLoad(contents), rootPkgInfo);
    }
    toDepGraph() {
        const builder = new dep_graph_1.DepGraphBuilder(this.pkgManager, this.rootPkgInfo);
        const allDeps = {};
        // Add all package nodes first, but collect dependencies
        this.internalData.PODS.forEach((elem) => {
            let pkgInfo;
            let pkgDeps;
            if (typeof elem === 'string') {
                // When there are NO dependencies. This equals in yaml e.g.
                //    - Expecta (1.0.5)
                pkgInfo = utils_1.pkgInfoFromSpecificationString(elem);
                pkgDeps = [];
            }
            else {
                // When there are dependencies. This equals in yaml e.g.
                //    - React/Core (0.59.2):
                //      - yoga (= 0.59.2.React)
                const objKey = Object.keys(elem)[0];
                pkgInfo = utils_1.pkgInfoFromSpecificationString(objKey);
                pkgDeps = elem[objKey].map(utils_1.pkgInfoFromDependencyString);
            }
            const nodeId = this.nodeIdForPkgInfo(pkgInfo);
            builder.addPkgNode(pkgInfo, nodeId, {
                labels: this.nodeInfoLabelsForPod(pkgInfo.name),
            });
            allDeps[nodeId] = pkgDeps;
        });
        // Connect explicitly in the manifest (`Podfile`)
        // declared dependencies to the root node.
        this.internalData.DEPENDENCIES.map(utils_1.pkgInfoFromDependencyString).forEach((pkgInfo) => {
            builder.connectDep(builder.rootNodeId, this.nodeIdForPkgInfo(pkgInfo));
        });
        // Now we can start to connect dependencies
        Object.entries(allDeps).forEach(([nodeId, pkgDeps]) => pkgDeps.forEach((pkgInfo) => {
            const depNodeId = this.nodeIdForPkgInfo(pkgInfo);
            if (!allDeps[depNodeId]) {
                // The pod is not a direct dependency of any targets of the integration,
                // which can happen for platform-specific transitives, when their platform
                // is not used in any target. (e.g. PromiseKit/UIKit is iOS-specific and is
                // a transitive of PromiseKit, but won't be included for a macOS project.)
                return;
            }
            builder.connectDep(nodeId, depNodeId);
        }));
        return builder.build();
    }
    /// CocoaPods guarantees that every pod is only present in one version,
    /// so we can use just the pod name as node ID.
    nodeIdForPkgInfo(pkgInfo) {
        return pkgInfo.name;
    }
    /// Gathers relevant info from the lockfile and transform
    /// them into the expected labels data structure.
    nodeInfoLabelsForPod(podName) {
        let nodeInfoLabels = {
            checksum: this.checksumForPod(podName),
        };
        const repository = this.repositoryForPod(podName);
        if (repository) {
            nodeInfoLabels = Object.assign(Object.assign({}, nodeInfoLabels), { repository });
        }
        const externalSourceInfo = this.externalSourceInfoForPod(podName);
        if (externalSourceInfo) {
            nodeInfoLabels = Object.assign(Object.assign({}, nodeInfoLabels), { externalSourcePodspec: externalSourceInfo[':podspec'], externalSourcePath: externalSourceInfo[':path'], externalSourceGit: externalSourceInfo[':git'], externalSourceTag: externalSourceInfo[':tag'], externalSourceCommit: externalSourceInfo[':commit'], externalSourceBranch: externalSourceInfo[':branch'] });
        }
        const checkoutOptions = this.checkoutOptionsForPod(podName);
        if (checkoutOptions) {
            nodeInfoLabels = Object.assign(Object.assign({}, nodeInfoLabels), { checkoutOptionsPodspec: checkoutOptions[':podspec'], checkoutOptionsPath: checkoutOptions[':path'], checkoutOptionsGit: checkoutOptions[':git'], checkoutOptionsTag: checkoutOptions[':tag'], checkoutOptionsCommit: checkoutOptions[':commit'], checkoutOptionsBranch: checkoutOptions[':branch'] });
        }
        // Sanitize labels by removing null fields
        // (as they don't survive a serialization/parse cycle and break tests)
        Object.entries(nodeInfoLabels).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                delete nodeInfoLabels[key];
            }
        });
        return nodeInfoLabels;
    }
    /// The checksum of the pod.
    checksumForPod(podName) {
        const rootName = utils_1.rootSpecName(podName);
        return this.internalData['SPEC CHECKSUMS'][rootName];
    }
    /// This can be either an URL or the local repository name.
    repositoryForPod(podName) {
        // Older Podfile.lock might not have this section yet.
        const specRepos = this.internalData['SPEC REPOS'];
        if (!specRepos) {
            return undefined;
        }
        const rootName = utils_1.rootSpecName(podName);
        const specRepoEntry = Object.entries(specRepos).find(([, deps]) => deps.includes(rootName));
        if (specRepoEntry) {
            return specRepoEntry[0];
        }
        return undefined;
    }
    /// Extracts the external source info for a given pod, if there is any.
    externalSourceInfoForPod(podName) {
        // Older Podfile.lock might not have this section yet.
        const externalSources = this.internalData['EXTERNAL SOURCES'];
        if (!externalSources) {
            return undefined;
        }
        const externalSourceEntry = externalSources[utils_1.rootSpecName(podName)];
        if (externalSourceEntry) {
            return externalSourceEntry;
        }
        return undefined;
    }
    /// Extracts the checkout options for a given pod, if there is any.
    checkoutOptionsForPod(podName) {
        // Older Podfile.lock might not have this section yet.
        const checkoutOptions = this.internalData['CHECKOUT OPTIONS'];
        if (!checkoutOptions) {
            return undefined;
        }
        const checkoutOptionsEntry = checkoutOptions[utils_1.rootSpecName(podName)];
        if (checkoutOptionsEntry) {
            return checkoutOptionsEntry;
        }
        return undefined;
    }
    get repositories() {
        // Older Podfile.lock might not have this section yet.
        const specRepos = this.internalData['SPEC REPOS'];
        if (!specRepos) {
            return [];
        }
        return Object.keys(specRepos).map((nameOrUrl) => {
            return { alias: nameOrUrl };
        });
    }
    get pkgManager() {
        return {
            name: 'cocoapods',
            version: this.cocoapodsVersion,
            repositories: this.repositories,
        };
    }
    /// The CocoaPods version encoded in the lockfile which was used to
    /// create this resolution.
    get cocoapodsVersion() {
        return this.internalData.COCOAPODS || 'unknown';
    }
    /// The checksum of the Podfile, which was used when resolving this integration.
    /// - Note: this was not tracked by earlier versions of CocoaPods.
    get podfileChecksum() {
        return this.internalData['PODFILE CHECKSUM'];
    }
}
exports.default = LockfileParser;
//# sourceMappingURL=lockfile-parser.js.map