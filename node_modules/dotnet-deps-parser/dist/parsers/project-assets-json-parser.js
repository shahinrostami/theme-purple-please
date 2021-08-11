"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getProjectNameForProjectAssetsJson(manifestFile) {
    var _a, _b, _c, _d;
    return _d = (_c = (_b = (_a = manifestFile) === null || _a === void 0 ? void 0 : _a.project) === null || _b === void 0 ? void 0 : _b.restore) === null || _c === void 0 ? void 0 : _c.projectName, (_d !== null && _d !== void 0 ? _d : {});
}
function getProjectVersionForProjectAssetsJson(manifestFile) {
    var _a, _b, _c;
    return _c = (_b = (_a = manifestFile) === null || _a === void 0 ? void 0 : _a.project) === null || _b === void 0 ? void 0 : _b.version, (_c !== null && _c !== void 0 ? _c : {});
}
function buildPackageTree(name, version) {
    const depTree = {
        dependencies: {},
        name,
        version,
    };
    return depTree;
}
// Currently the function getDependencyTreeFromProjectAssetsJson returns
// a two level deep flat list of 100% of dependencies.
// TODO: Get full tree
function getDependencyTreeFromProjectAssetsJson(manifestFile, targetFrameWork) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const projectName = getProjectNameForProjectAssetsJson(manifestFile);
    const projectVersion = getProjectVersionForProjectAssetsJson(manifestFile);
    const depTree = buildPackageTree(projectName, projectVersion);
    const topLevelDeps = Object.keys((_c = (_b = (_a = manifestFile) === null || _a === void 0 ? void 0 : _a.targets) === null || _b === void 0 ? void 0 : _b[targetFrameWork], (_c !== null && _c !== void 0 ? _c : {})));
    for (const topLevelDep of topLevelDeps) {
        const [topLevelDepName, topLevelDepVersion] = topLevelDep.split('/');
        const topLevelDepTree = buildPackageTree(topLevelDepName, topLevelDepVersion);
        const transitiveDeps = (_h = (_g = (_f = (_e = (_d = manifestFile) === null || _d === void 0 ? void 0 : _d.targets) === null || _e === void 0 ? void 0 : _e[targetFrameWork]) === null || _f === void 0 ? void 0 : _f[topLevelDep]) === null || _g === void 0 ? void 0 : _g.dependencies, (_h !== null && _h !== void 0 ? _h : {}));
        for (const transitiveDep of Object.keys(transitiveDeps)) {
            const transitiveDepVersion = transitiveDeps[transitiveDep];
            const transitiveDepTree = buildPackageTree(transitiveDep, transitiveDepVersion);
            topLevelDepTree.dependencies[transitiveDep] = transitiveDepTree;
        }
        depTree.dependencies[topLevelDepName] = topLevelDepTree;
    }
    return depTree;
}
exports.getDependencyTreeFromProjectAssetsJson = getDependencyTreeFromProjectAssetsJson;
//# sourceMappingURL=project-assets-json-parser.js.map