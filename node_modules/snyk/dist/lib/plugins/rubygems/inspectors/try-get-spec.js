"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryGetSpec = void 0;
const path = require("path");
const fs = require("fs");
async function tryGetSpec(dir, name) {
    const filePath = path.resolve(dir, name);
    if (fs.existsSync(filePath)) {
        return {
            name,
            contents: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
        };
    }
    return null;
}
exports.tryGetSpec = tryGetSpec;
//# sourceMappingURL=try-get-spec.js.map