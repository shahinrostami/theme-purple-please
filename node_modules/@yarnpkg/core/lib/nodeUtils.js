"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtinModules = exports.dynamicRequire = void 0;
const tslib_1 = require("tslib");
const module_1 = tslib_1.__importDefault(require("module"));
function dynamicRequire(request) {
    const req = typeof __non_webpack_require__ !== `undefined`
        ? __non_webpack_require__
        : require;
    return req(request);
}
exports.dynamicRequire = dynamicRequire;
function builtinModules() {
    // @ts-expect-error
    return new Set(module_1.default.builtinModules || Object.keys(process.binding(`natives`)));
}
exports.builtinModules = builtinModules;
