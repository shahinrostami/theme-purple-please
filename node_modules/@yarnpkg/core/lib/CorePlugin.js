"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorePlugin = void 0;
const tslib_1 = require("tslib");
const MessageName_1 = require("./MessageName");
const structUtils = tslib_1.__importStar(require("./structUtils"));
exports.CorePlugin = {
    hooks: {
        reduceDependency: (dependency, project, locator, initialDependency, { resolver, resolveOptions }) => {
            for (const { pattern, reference } of project.topLevelWorkspace.manifest.resolutions) {
                if (pattern.from && pattern.from.fullName !== structUtils.requirableIdent(locator))
                    continue;
                if (pattern.from && pattern.from.description && pattern.from.description !== locator.reference)
                    continue;
                if (pattern.descriptor.fullName !== structUtils.requirableIdent(dependency))
                    continue;
                if (pattern.descriptor.description && pattern.descriptor.description !== dependency.range)
                    continue;
                const alias = resolver.bindDescriptor(structUtils.makeDescriptor(dependency, reference), project.topLevelWorkspace.anchoredLocator, resolveOptions);
                return alias;
            }
            return dependency;
        },
        validateProject: async (project, report) => {
            for (const workspace of project.workspaces) {
                const workspaceName = structUtils.prettyWorkspace(project.configuration, workspace);
                await project.configuration.triggerHook(hooks => {
                    return hooks.validateWorkspace;
                }, workspace, {
                    reportWarning: (name, text) => report.reportWarning(name, `${workspaceName}: ${text}`),
                    reportError: (name, text) => report.reportError(name, `${workspaceName}: ${text}`),
                });
            }
        },
        validateWorkspace: async (workspace, report) => {
            // Validate manifest
            const { manifest } = workspace;
            if (manifest.resolutions.length && workspace.cwd !== workspace.project.cwd)
                manifest.errors.push(new Error(`Resolutions field will be ignored`));
            for (const manifestError of manifest.errors) {
                report.reportWarning(MessageName_1.MessageName.INVALID_MANIFEST, manifestError.message);
            }
        },
    },
};
