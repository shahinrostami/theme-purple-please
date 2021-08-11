import { PortablePath } from '@yarnpkg/fslib';
export declare function makeUpdater(filename: PortablePath): Promise<{
    open(cb: (value: Object) => void): void;
    save(): Promise<void>;
}>;
export declare function updateAndSave(filename: PortablePath, cb: (value: Object) => void): Promise<void>;
