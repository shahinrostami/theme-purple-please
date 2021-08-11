"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageSize = void 0;
const get_manifest_1 = require("./get-manifest");
async function getImageSize(registryBase, repo, tag, username, password, options = {}) {
    const manifest = await get_manifest_1.getManifest(registryBase, repo, tag, username, password, options);
    return manifest.layers.reduce((size, layerConfig) => size + layerConfig.size, 0);
}
exports.getImageSize = getImageSize;
//# sourceMappingURL=get-image-size.js.map