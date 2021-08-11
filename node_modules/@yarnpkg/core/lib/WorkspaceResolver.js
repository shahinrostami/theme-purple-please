"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceResolver = void 0;
const types_1 = require("./types");
class WorkspaceResolver {
    supportsDescriptor(descriptor, opts) {
        if (descriptor.range.startsWith(WorkspaceResolver.protocol))
            return true;
        const workspace = opts.project.tryWorkspaceByDescriptor(descriptor);
        if (workspace !== null)
            return true;
        return false;
    }
    supportsLocator(locator, opts) {
        if (!locator.reference.startsWith(WorkspaceResolver.protocol))
            return false;
        return true;
    }
    shouldPersistResolution(locator, opts) {
        return false;
    }
    bindDescriptor(descriptor, fromLocator, opts) {
        return descriptor;
    }
    getResolutionDependencies(descriptor, opts) {
        return [];
    }
    async getCandidates(descriptor, dependencies, opts) {
        const workspace = opts.project.getWorkspaceByDescriptor(descriptor);
        return [workspace.anchoredLocator];
    }
    async getSatisfying(descriptor, references, opts) {
        return null;
    }
    async resolve(locator, opts) {
        const workspace = opts.project.getWorkspaceByCwd(locator.reference.slice(WorkspaceResolver.protocol.length));
        return {
            ...locator,
            version: workspace.manifest.version || `0.0.0`,
            languageName: `unknown`,
            linkType: types_1.LinkType.SOFT,
            dependencies: new Map([...workspace.manifest.dependencies, ...workspace.manifest.devDependencies]),
            peerDependencies: new Map([...workspace.manifest.peerDependencies]),
            dependenciesMeta: workspace.manifest.dependenciesMeta,
            peerDependenciesMeta: workspace.manifest.peerDependenciesMeta,
            bin: workspace.manifest.bin,
        };
    }
}
exports.WorkspaceResolver = WorkspaceResolver;
WorkspaceResolver.protocol = `workspace:`;
