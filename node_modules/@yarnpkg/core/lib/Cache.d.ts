import { FakeFS, ZipFS, PortablePath, Filename } from '@yarnpkg/fslib';
import { Configuration } from './Configuration';
import { LocatorHash, Locator } from './types';
export declare type FetchFromCacheOptions = {
    checksums: Map<LocatorHash, Locator>;
};
export declare class Cache {
    readonly configuration: Configuration;
    readonly cwd: PortablePath;
    readonly markedFiles: Set<PortablePath>;
    readonly immutable: boolean;
    readonly check: boolean;
    readonly cacheKey: string;
    private mutexes;
    static find(configuration: Configuration, { immutable, check }?: {
        immutable?: boolean;
        check?: boolean;
    }): Promise<Cache>;
    constructor(cacheCwd: PortablePath, { configuration, immutable, check }: {
        configuration: Configuration;
        immutable?: boolean;
        check?: boolean;
    });
    get mirrorCwd(): PortablePath | null;
    getVersionFilename(locator: Locator): Filename;
    getChecksumFilename(locator: Locator, checksum: string): Filename;
    getLocatorPath(locator: Locator, expectedChecksum: string | null): PortablePath | null;
    getLocatorMirrorPath(locator: Locator): PortablePath | null;
    setup(): Promise<void>;
    fetchPackageFromCache(locator: Locator, expectedChecksum: string | null, { onHit, onMiss, loader, skipIntegrityCheck }: {
        onHit?: () => void;
        onMiss?: () => void;
        loader?: () => Promise<ZipFS>;
        skipIntegrityCheck?: boolean;
    }): Promise<[FakeFS<PortablePath>, () => void, string]>;
    private writeFileWithLock;
}
