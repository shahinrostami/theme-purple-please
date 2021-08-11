"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolResolver = exports.TAG_REGEXP = void 0;
const tslib_1 = require("tslib");
const semver_1 = tslib_1.__importDefault(require("semver"));
const semverUtils = tslib_1.__importStar(require("./semverUtils"));
const structUtils = tslib_1.__importStar(require("./structUtils"));
exports.TAG_REGEXP = /^(?!v)[a-z0-9-.]+$/i;
class ProtocolResolver {
    supportsDescriptor(descriptor, opts) {
        if (semverUtils.validRange(descriptor.range))
            return true;
        if (exports.TAG_REGEXP.test(descriptor.range))
            return true;
        return false;
    }
    supportsLocator(locator, opts) {
        if (semver_1.default.valid(locator.reference))
            return true;
        if (exports.TAG_REGEXP.test(locator.reference))
            return true;
        return false;
    }
    shouldPersistResolution(locator, opts) {
        return opts.resolver.shouldPersistResolution(this.forwardLocator(locator, opts), opts);
    }
    bindDescriptor(descriptor, fromLocator, opts) {
        return opts.resolver.bindDescriptor(this.forwardDescriptor(descriptor, opts), fromLocator, opts);
    }
    getResolutionDependencies(descriptor, opts) {
        return opts.resolver.getResolutionDependencies(this.forwardDescriptor(descriptor, opts), opts);
    }
    async getCandidates(descriptor, dependencies, opts) {
        return await opts.resolver.getCandidates(this.forwardDescriptor(descriptor, opts), dependencies, opts);
    }
    async getSatisfying(descriptor, references, opts) {
        return await opts.resolver.getSatisfying(this.forwardDescriptor(descriptor, opts), references, opts);
    }
    async resolve(locator, opts) {
        const pkg = await opts.resolver.resolve(this.forwardLocator(locator, opts), opts);
        return structUtils.renamePackage(pkg, locator);
    }
    forwardDescriptor(descriptor, opts) {
        return structUtils.makeDescriptor(descriptor, `${opts.project.configuration.get(`defaultProtocol`)}${descriptor.range}`);
    }
    forwardLocator(locator, opts) {
        return structUtils.makeLocator(locator, `${opts.project.configuration.get(`defaultProtocol`)}${locator.reference}`);
    }
}
exports.ProtocolResolver = ProtocolResolver;
