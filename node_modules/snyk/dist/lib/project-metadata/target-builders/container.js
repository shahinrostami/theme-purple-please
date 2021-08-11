"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfo = void 0;
async function getInfo(isFromContainer, scannedProject, packageInfo) {
    var _a;
    // safety check
    if (!isFromContainer) {
        return null;
    }
    const imageNameOnProjectMeta = scannedProject.meta && scannedProject.meta.imageName;
    return {
        image: imageNameOnProjectMeta || ((_a = packageInfo) === null || _a === void 0 ? void 0 : _a.image) || (packageInfo === null || packageInfo === void 0 ? void 0 : packageInfo.name),
    };
}
exports.getInfo = getInfo;
//# sourceMappingURL=container.js.map