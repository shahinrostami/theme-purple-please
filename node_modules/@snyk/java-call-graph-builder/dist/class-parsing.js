"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toFQclassName = exports.removeParams = void 0;
function removeParams(functionCall) {
    // com/ibm/wala/FakeRootClass.fakeRootMethod:()V
    return functionCall.split(':')[0];
}
exports.removeParams = removeParams;
function toFQclassName(functionCall) {
    // com/ibm/wala/FakeRootClass.fakeRootMethod -> com.ibm.wala.FakeRootClass:fakeRootMethod
    return functionCall.replace('.', ':').replace(/\//g, '.');
}
exports.toFQclassName = toFQclassName;
//# sourceMappingURL=class-parsing.js.map