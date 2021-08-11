"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
class FileParser {
    static parseLockFile(lockFileContent) {
        try {
            return JSON.parse(lockFileContent);
        }
        catch (e) {
            throw new errors_1.ParseError(`Failed to parse lock file. Error: ${e.message}`);
        }
    }
    static parseManifestFile(manifestFileContent) {
        try {
            return JSON.parse(manifestFileContent);
        }
        catch (e) {
            throw new errors_1.ParseError(`Failed to parse manifest file. Error: ${e.message}`);
        }
    }
}
exports.FileParser = FileParser;
//# sourceMappingURL=file-parser.js.map