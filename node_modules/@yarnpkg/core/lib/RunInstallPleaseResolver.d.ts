import { Resolver, ResolveOptions, MinimalResolveOptions } from './Resolver';
import { Descriptor, Locator } from './types';
export declare class RunInstallPleaseResolver implements Resolver {
    private readonly resolver;
    constructor(resolver: Resolver);
    supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions): boolean;
    supportsLocator(locator: Locator, opts: MinimalResolveOptions): boolean;
    shouldPersistResolution(locator: Locator, opts: MinimalResolveOptions): boolean;
    bindDescriptor(descriptor: Descriptor, fromLocator: Locator, opts: MinimalResolveOptions): Descriptor;
    getResolutionDependencies(descriptor: Descriptor, opts: MinimalResolveOptions): Descriptor[];
    getCandidates(descriptor: Descriptor, dependencies: unknown, opts: ResolveOptions): Promise<never>;
    getSatisfying(descriptor: Descriptor, references: Array<string>, opts: ResolveOptions): Promise<never>;
    resolve(locator: Locator, opts: ResolveOptions): Promise<never>;
}
