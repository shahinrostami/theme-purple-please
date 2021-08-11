import { FakeFS, NativePath, PortablePath } from '@yarnpkg/fslib';
import { PnpApi, RuntimeState } from '../types';
export declare type MakeApiOptions = {
    allowDebug?: boolean;
    compatibilityMode?: boolean;
    fakeFs: FakeFS<PortablePath>;
    pnpapiResolution: NativePath;
};
export declare type ResolveToUnqualifiedOptions = {
    considerBuiltins?: boolean;
};
export declare type ResolveUnqualifiedOptions = {
    extensions?: Array<string>;
};
export declare type ResolveRequestOptions = ResolveToUnqualifiedOptions & ResolveUnqualifiedOptions;
export declare function makeApi(runtimeState: RuntimeState, opts: MakeApiOptions): PnpApi;
