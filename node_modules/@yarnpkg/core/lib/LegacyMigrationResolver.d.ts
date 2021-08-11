import { Project } from './Project';
import { Report } from './Report';
import { Resolver, ResolveOptions, MinimalResolveOptions } from './Resolver';
import { Descriptor, Locator } from './types';
export declare class LegacyMigrationResolver implements Resolver {
    private resolutions;
    setup(project: Project, { report }: {
        report: Report;
    }): Promise<void>;
    supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions): boolean;
    supportsLocator(locator: Locator, opts: MinimalResolveOptions): boolean;
    shouldPersistResolution(locator: Locator, opts: MinimalResolveOptions): never;
    bindDescriptor(descriptor: Descriptor, fromLocator: Locator, opts: MinimalResolveOptions): Descriptor;
    getResolutionDependencies(descriptor: Descriptor, opts: MinimalResolveOptions): never[];
    getCandidates(descriptor: Descriptor, dependencies: unknown, opts: ResolveOptions): Promise<Locator[]>;
    getSatisfying(descriptor: Descriptor, references: Array<string>, opts: ResolveOptions): Promise<null>;
    resolve(locator: Locator, opts: ResolveOptions): Promise<never>;
}
