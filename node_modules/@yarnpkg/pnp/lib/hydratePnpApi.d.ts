import { FakeFS, PortablePath } from '@yarnpkg/fslib';
export declare function hydratePnpFile(location: string, { fakeFs, pnpapiResolution }: {
    fakeFs: FakeFS<PortablePath>;
    pnpapiResolution: string;
}): Promise<import("./types").PnpApi>;
export declare function hydratePnpSource(source: string, { basePath, fakeFs, pnpapiResolution }: {
    basePath: string;
    fakeFs: FakeFS<PortablePath>;
    pnpapiResolution: string;
}): import("./types").PnpApi;
