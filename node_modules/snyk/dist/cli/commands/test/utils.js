"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathWithOptionalProjectName = void 0;
function getPathWithOptionalProjectName(currPath, testResult) {
    let projectName = testResult.projectName;
    if (projectName) {
        const index = projectName.indexOf('/');
        if (index > -1) {
            projectName = projectName.substr(index + 1);
        }
        else {
            projectName = undefined;
        }
    }
    const pathWithOptionalProjectName = projectName
        ? `${currPath}/${projectName}`
        : currPath;
    return pathWithOptionalProjectName;
}
exports.getPathWithOptionalProjectName = getPathWithOptionalProjectName;
//# sourceMappingURL=utils.js.map