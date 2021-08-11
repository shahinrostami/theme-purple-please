"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSingleResultToMultiCustom = void 0;
function convertSingleResultToMultiCustom(inspectRes, packageManager) {
    if (!packageManager) {
        packageManager = inspectRes.plugin
            .packageManager;
    }
    if (inspectRes.dependencyGraph) {
        return convertDepGraphResult(inspectRes, packageManager);
    }
    else {
        return convertDepTreeResult(inspectRes, packageManager);
    }
}
exports.convertSingleResultToMultiCustom = convertSingleResultToMultiCustom;
function convertDepGraphResult(inspectRes, packageManager) {
    const { plugin, meta, dependencyGraph: depGraph, callGraph } = inspectRes;
    return {
        plugin,
        scannedProjects: [
            {
                plugin: plugin,
                depGraph,
                callGraph: callGraph,
                meta,
                targetFile: plugin.targetFile,
                packageManager,
            },
        ],
    };
}
/**
 * @deprecated @boost: delete me when all languages uses depGraph
 */
function convertDepTreeResult(inspectRes, packageManager) {
    if (inspectRes.package &&
        !inspectRes.package.targetFile &&
        inspectRes.plugin) {
        inspectRes.package.targetFile = inspectRes.plugin.targetFile;
    }
    const { plugin, meta, package: depTree, callGraph } = inspectRes;
    if (depTree && !depTree.targetFile && plugin) {
        depTree.targetFile = plugin.targetFile;
    }
    return {
        plugin,
        scannedProjects: [
            {
                plugin: plugin,
                depTree,
                callGraph: callGraph,
                meta,
                targetFile: plugin.targetFile,
                packageManager,
            },
        ],
    };
}
//# sourceMappingURL=convert-single-splugin-res-to-multi-custom.js.map