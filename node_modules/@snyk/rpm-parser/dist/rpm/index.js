"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const header_1 = require("./header");
const extensions_1 = require("./extensions");
/**
 * Extracts as much package information as available from a blob of RPM metadata.
 * Returns undefined if the package cannot be constructed due to missing or corrupt data.
 * @param data A blob of RPM metadata, as stored inside BerkeleyDB.
 */
async function bufferToPackageInfo(data) {
    const entries = await header_1.headerImport(data);
    const packageInfo = await extensions_1.getPackageInfo(entries);
    return packageInfo;
}
exports.bufferToPackageInfo = bufferToPackageInfo;
//# sourceMappingURL=index.js.map