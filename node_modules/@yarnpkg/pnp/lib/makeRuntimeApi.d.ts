import { PortablePath } from '@yarnpkg/fslib';
import { FakeFS } from '@yarnpkg/fslib';
import { PnpSettings, PnpApi } from "./types";
export declare const makeRuntimeApi: (settings: PnpSettings, basePath: string, fakeFs: FakeFS<PortablePath>) => PnpApi;
