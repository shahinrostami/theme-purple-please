"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContainerImageSavePath = exports.getContainerProjectName = exports.getContainerName = exports.getContainerTargetFile = exports.isContainer = exports.IMAGE_SAVE_PATH_ENV_VAR = exports.IMAGE_SAVE_PATH_OPT = void 0;
const user_config_1 = require("../user-config");
exports.IMAGE_SAVE_PATH_OPT = 'imageSavePath';
exports.IMAGE_SAVE_PATH_ENV_VAR = 'SNYK_IMAGE_SAVE_PATH';
function isContainer(scannedProject) {
    var _a, _b;
    return (_b = (_a = scannedProject.meta) === null || _a === void 0 ? void 0 : _a.imageName) === null || _b === void 0 ? void 0 : _b.length;
}
exports.isContainer = isContainer;
function getContainerTargetFile(scannedProject) {
    return scannedProject.targetFile;
}
exports.getContainerTargetFile = getContainerTargetFile;
function getContainerName(scannedProject, meta) {
    var _a, _b;
    let name = (_a = scannedProject.meta) === null || _a === void 0 ? void 0 : _a.imageName;
    if ((_b = meta['project-name']) === null || _b === void 0 ? void 0 : _b.length) {
        name = meta['project-name'];
    }
    if (scannedProject.targetFile) {
        // for app+os projects the name of project is a mix of the image name
        // with the target file (if one exists)
        return name + ':' + scannedProject.targetFile;
    }
    else {
        return name;
    }
}
exports.getContainerName = getContainerName;
function getContainerProjectName(scannedProject, meta) {
    var _a, _b;
    let name = (_a = scannedProject.meta) === null || _a === void 0 ? void 0 : _a.imageName;
    if ((_b = meta['project-name']) === null || _b === void 0 ? void 0 : _b.length) {
        name = meta['project-name'];
    }
    return name;
}
exports.getContainerProjectName = getContainerProjectName;
function getContainerImageSavePath() {
    return (process.env[exports.IMAGE_SAVE_PATH_ENV_VAR] ||
        user_config_1.config.get(exports.IMAGE_SAVE_PATH_OPT) ||
        undefined);
}
exports.getContainerImageSavePath = getContainerImageSavePath;
//# sourceMappingURL=index.js.map