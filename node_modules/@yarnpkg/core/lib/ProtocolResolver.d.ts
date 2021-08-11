import { Resolver, ResolveOptions, MinimalResolveOptions } from './Resolver';
import { Descriptor, Locator, DescriptorHash, Package } from './types';
export declare const TAG_REGEXP: RegExp;
export declare class ProtocolResolver implements Resolver {
    supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions): boolean;
    supportsLocator(locator: Locator, opts: MinimalResolveOptions): boolean;
    shouldPersistResolution(locator: Locator, opts: MinimalResolveOptions): boolean;
    bindDescriptor(descriptor: Descriptor, fromLocator: Locator, opts: MinimalResolveOptions): Descriptor;
    getResolutionDependencies(descriptor: Descriptor, opts: MinimalResolveOptions): Descriptor[];
    getCandidates(descriptor: Descriptor, dependencies: Map<DescriptorHash, Package>, opts: ResolveOptions): Promise<Locator[]>;
    getSatisfying(descriptor: Descriptor, references: Array<string>, opts: ResolveOptions): Promise<Locator[] | null>;
    resolve(locator: Locator, opts: ResolveOptions): Promise<Package>;
    private forwardDescriptor;
    private forwardLocator;
}
