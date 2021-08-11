import { FakeFS, PortablePath } from '@yarnpkg/fslib';
import { PnpApi } from '../types';
import { Manager } from './makeManager';
export declare type ApplyPatchOptions = {
    fakeFs: FakeFS<PortablePath>;
    manager: Manager;
};
export declare function applyPatch(pnpapi: PnpApi, opts: ApplyPatchOptions): void;
