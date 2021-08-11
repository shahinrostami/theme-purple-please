"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = void 0;
const crypto = require("crypto");
const fs = require("fs");
async function hash(filePath, fileEncoding = 'utf8', hashAlgorithm = 'md5', hashEncoding = 'hex') {
    const fileStream = fs.createReadStream(filePath, { encoding: fileEncoding });
    const fileHash = crypto.createHash(hashAlgorithm);
    return new Promise((resolve, reject) => {
        fileStream.on('data', (data) => fileHash.update(data));
        fileStream.on('end', () => resolve(fileHash.digest(hashEncoding)));
        fileStream.on('error', (error) => reject(error));
    });
}
exports.hash = hash;
//# sourceMappingURL=hash.js.map