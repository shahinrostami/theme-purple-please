"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlink = exports.readFile = exports.readDir = void 0;
const fs = require("fs");
const util_1 = require("util");
exports.readDir = util_1.promisify(fs.readdir);
exports.readFile = util_1.promisify(fs.readFile);
exports.unlink = util_1.promisify(fs.unlink);
//# sourceMappingURL=common.js.map