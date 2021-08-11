import { Resolver, ResolveOptions, MinimalResolveOptions } from './Resolver';
import { Descriptor, Locator } from './types';
export declare class LockfileResolver implements Resolver {
    supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions): boolean;
    supportsLocator(locator: Locator, opts: MinimalResolveOptions): boolean;
    shouldPersistResolution(locator: Locator, opts: MinimalResolveOptions): boolean;
    bindDescriptor(descriptor: Descriptor, fromLocator: Locator, opts: MinimalResolveOptions): Descriptor;
    getResolutionDependencies(descriptor: Descriptor, opts: MinimalResolveOptions): never[];
    getCandidates(descriptor: Descriptor, dependencies: unknown, opts: ResolveOptions): Promise<import("./types").Package[]>;
    getSatisfying(descriptor: Descriptor, references: Array<string>, opts: ResolveOptions): Promise<null>;
    resolve(locator: Locator, opts: ResolveOptions): Promise<import("./types").Package>;
}
