"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingSubProjectError = void 0;
class MissingSubProjectError extends Error {
    constructor(subProject, allProjects) {
        super(`Specified sub-project not found: "${subProject}". ` +
            `Found these projects: ${allProjects.join(', ')}`);
        this.name = 'MissingSubProjectError';
        this.subProject = subProject;
        this.allProjects = allProjects;
        Error.captureStackTrace(this, MissingSubProjectError);
    }
}
exports.MissingSubProjectError = MissingSubProjectError;
//# sourceMappingURL=missing-sub-project-error.js.map