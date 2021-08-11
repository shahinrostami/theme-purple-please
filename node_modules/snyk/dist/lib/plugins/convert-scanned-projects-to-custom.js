"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertScannedProjectsToCustom = void 0;
function convertScannedProjectsToCustom(scannedProjects, pluginMeta, packageManager, targetFile) {
    // annotate the package manager & targetFile to be used
    // for test & monitor
    return scannedProjects.map((a) => {
        a.plugin =
            a.plugin || pluginMeta;
        a.targetFile = a.targetFile || targetFile;
        a.packageManager = a
            .packageManager
            ? a.packageManager
            : packageManager;
        a.meta = a.meta;
        return a;
    });
}
exports.convertScannedProjectsToCustom = convertScannedProjectsToCustom;
//# sourceMappingURL=convert-scanned-projects-to-custom.js.map