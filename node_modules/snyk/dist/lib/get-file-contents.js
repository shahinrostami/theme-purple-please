"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileContents = void 0;
const fs = require("fs");
const path = require("path");
function getFileContents(root, fileName) {
    const fullPath = path.resolve(root, fileName);
    if (!fs.existsSync(fullPath)) {
        throw new Error('Manifest ' + fileName + ' not found at location: ' + fileName);
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    return {
        content,
        fileName,
    };
}
exports.getFileContents = getFileContents;
//# sourceMappingURL=get-file-contents.js.map