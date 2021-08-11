import { AliasFS } from '@yarnpkg/fslib';
import { Fetcher, FetchOptions } from './Fetcher';
import { Locator } from './types';
export declare class VirtualFetcher implements Fetcher {
    supports(locator: Locator): boolean;
    getLocalPath(locator: Locator, opts: FetchOptions): import("@yarnpkg/fslib").PortablePath | null;
    fetch(locator: Locator, opts: FetchOptions): Promise<{
        packageFs: AliasFS<import("@yarnpkg/fslib").PortablePath>;
        releaseFs?: (() => void) | undefined;
        prefixPath: import("@yarnpkg/fslib").PortablePath;
        localPath?: import("@yarnpkg/fslib").PortablePath | null | undefined;
        checksum?: string | undefined;
        discardFromLookup?: boolean | undefined;
    }>;
    getLocatorFilename(locator: Locator): import("@yarnpkg/fslib").Filename;
    private ensureVirtualLink;
}
