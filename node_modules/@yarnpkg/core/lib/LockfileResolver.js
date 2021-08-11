"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockfileResolver = void 0;
const tslib_1 = require("tslib");
const structUtils = tslib_1.__importStar(require("./structUtils"));
class LockfileResolver {
    supportsDescriptor(descriptor, opts) {
        const resolution = opts.project.storedResolutions.get(descriptor.descriptorHash);
        if (resolution)
            return true;
        // If the descriptor matches a package that's already been used, we can just use it even if we never resolved the range before
        // Ex: foo depends on bar@^1.0.0 that we resolved to foo@1.1.0, then we add a package qux that depends on foo@1.1.0 (without the caret)
        if (opts.project.originalPackages.has(structUtils.convertDescriptorToLocator(descriptor).locatorHash))
            return true;
        return false;
    }
    supportsLocator(locator, opts) {
        if (opts.project.originalPackages.has(locator.locatorHash))
            return true;
        return false;
    }
    shouldPersistResolution(locator, opts) {
        throw new Error(`The shouldPersistResolution method shouldn't be called on the lockfile resolver, which would always answer yes`);
    }
    bindDescriptor(descriptor, fromLocator, opts) {
        return descriptor;
    }
    getResolutionDependencies(descriptor, opts) {
        return [];
    }
    async getCandidates(descriptor, dependencies, opts) {
        let pkg = opts.project.originalPackages.get(structUtils.convertDescriptorToLocator(descriptor).locatorHash);
        if (pkg)
            return [pkg];
        const resolution = opts.project.storedResolutions.get(descriptor.descriptorHash);
        if (!resolution)
            throw new Error(`Expected the resolution to have been successful - resolution not found`);
        pkg = opts.project.originalPackages.get(resolution);
        if (!pkg)
            throw new Error(`Expected the resolution to have been successful - package not found`);
        return [pkg];
    }
    async getSatisfying(descriptor, references, opts) {
        return null;
    }
    async resolve(locator, opts) {
        const pkg = opts.project.originalPackages.get(locator.locatorHash);
        if (!pkg)
            throw new Error(`The lockfile resolver isn't meant to resolve packages - they should already have been stored into a cache`);
        return pkg;
    }
}
exports.LockfileResolver = LockfileResolver;
