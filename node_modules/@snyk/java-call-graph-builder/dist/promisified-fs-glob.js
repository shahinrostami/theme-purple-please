"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.glob = exports.rmdir = exports.writeFile = exports.readFile = exports.mkdtemp = exports.mkdir = exports.unlink = exports.rename = exports.exists = void 0;
const util_1 = require("util");
const fs = require("fs");
const globOrig = require("glob");
exports.exists = util_1.promisify(fs.exists);
exports.rename = util_1.promisify(fs.rename);
exports.unlink = util_1.promisify(fs.unlink);
exports.mkdir = util_1.promisify(fs.mkdir);
exports.mkdtemp = util_1.promisify(fs.mkdtemp);
exports.readFile = util_1.promisify(fs.readFile);
exports.writeFile = util_1.promisify(fs.writeFile);
exports.rmdir = util_1.promisify(fs.rmdir);
exports.glob = util_1.promisify(globOrig);
//# sourceMappingURL=promisified-fs-glob.js.map