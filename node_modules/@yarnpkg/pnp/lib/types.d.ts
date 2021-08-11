import { NativePath, PortablePath, Path } from '@yarnpkg/fslib';
export declare enum LinkType {
    HARD = "HARD",
    SOFT = "SOFT"
}
export declare type PhysicalPackageLocator = {
    name: string;
    reference: string;
};
export declare type TopLevelPackageLocator = {
    name: null;
    reference: null;
};
export declare type PackageLocator = PhysicalPackageLocator | TopLevelPackageLocator;
export declare type DependencyTarget = string | [string, string] | null;
export declare type PackageInformation<P extends Path> = {
    packageLocation: P;
    packageDependencies: Map<string, DependencyTarget>;
    packagePeers: Set<string>;
    linkType: LinkType;
    discardFromLookup: boolean;
};
export declare type PackageInformationData<P extends Path> = {
    packageLocation: P;
    packageDependencies: Array<[string, DependencyTarget]>;
    packagePeers?: Array<string>;
    linkType: LinkType;
    discardFromLookup?: boolean;
};
export declare type PackageStore = Map<string | null, PackageInformation<PortablePath>>;
export declare type PackageStoreData = Array<[string | null, PackageInformationData<PortablePath>]>;
export declare type PackageRegistry = Map<string | null, PackageStore>;
export declare type PackageRegistryData = Array<[string | null, PackageStoreData]>;
export declare type LocationBlacklistData = Array<PortablePath>;
export declare type LocationLengthData = Array<number>;
export declare type SerializedState = {
    __info: Array<string>;
    enableTopLevelFallback: boolean;
    fallbackExclusionList: Array<[string, Array<string>]>;
    fallbackPool: Array<[string, DependencyTarget]>;
    ignorePatternData: string | null;
    locationBlacklistData: LocationBlacklistData;
    packageRegistryData: PackageRegistryData;
    dependencyTreeRoots: Array<PhysicalPackageLocator>;
};
export declare type RuntimeState = {
    basePath: PortablePath;
    enableTopLevelFallback: boolean;
    fallbackExclusionList: Map<string, Set<string>>;
    fallbackPool: Map<string, DependencyTarget>;
    ignorePattern: RegExp | null;
    packageLocationLengths: Array<number>;
    packageLocatorsByLocations: Map<PortablePath, PhysicalPackageLocator | null>;
    packageRegistry: PackageRegistry;
    dependencyTreeRoots: Array<PhysicalPackageLocator>;
};
export declare type PnpSettings = {
    blacklistedLocations?: Iterable<PortablePath>;
    enableTopLevelFallback?: boolean;
    fallbackExclusionList?: Array<PhysicalPackageLocator>;
    fallbackPool?: Map<string, DependencyTarget>;
    ignorePattern?: string | null;
    packageRegistry: PackageRegistry;
    shebang?: string | null;
    dependencyTreeRoots: Array<PhysicalPackageLocator>;
};
export declare type PnpApi = {
    VERSIONS: {
        std: number;
        [key: string]: number;
    };
    topLevel: {
        name: null;
        reference: null;
    };
    getLocator: (name: string, referencish: string | [string, string]) => PhysicalPackageLocator;
    getDependencyTreeRoots: () => Array<PhysicalPackageLocator>;
    getPackageInformation: (locator: PackageLocator) => PackageInformation<NativePath> | null;
    findPackageLocator: (location: NativePath) => PhysicalPackageLocator | null;
    resolveToUnqualified: (request: string, issuer: NativePath | null, opts?: {
        considerBuiltins?: boolean;
    }) => NativePath | null;
    resolveUnqualified: (unqualified: NativePath, opts?: {
        extensions?: Array<string>;
    }) => NativePath;
    resolveRequest: (request: string, issuer: NativePath | null, opts?: {
        considerBuiltins?: boolean;
        extensions?: Array<string>;
    }) => NativePath | null;
    resolveVirtual?: (p: NativePath) => NativePath | null;
    getAllLocators?: () => Array<PhysicalPackageLocator>;
};
