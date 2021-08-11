/// <reference types="node" />
import { FakeFS, NativePath, PortablePath } from '@yarnpkg/fslib';
import fs from 'fs';
import { Module } from 'module';
import { PnpApi } from '../types';
export declare type ApiMetadata = {
    cache: typeof Module._cache;
    instance: PnpApi;
    stats: fs.Stats;
    lastRefreshCheck: number;
};
export declare type MakeManagerOptions = {
    fakeFs: FakeFS<PortablePath>;
};
export declare type Manager = ReturnType<typeof makeManager>;
export declare function makeManager(pnpapi: PnpApi, opts: MakeManagerOptions): {
    getApiPathFromParent: (parent: Module | null | undefined) => PortablePath | null;
    findApiPathFor: (modulePath: NativePath) => PortablePath | null;
    getApiEntry: (pnpApiPath: PortablePath, refresh?: boolean) => ApiMetadata;
};
