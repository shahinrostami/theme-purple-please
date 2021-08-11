/// <reference types="node" />
import { FakeFS, PortablePath, ZipCompression, ZipFS } from '@yarnpkg/fslib';
interface MakeArchiveFromDirectoryOptions {
    baseFs?: FakeFS<PortablePath>;
    prefixPath?: PortablePath | null;
    compressionLevel?: ZipCompression;
    inMemory?: boolean;
}
export declare function makeArchiveFromDirectory(source: PortablePath, { baseFs, prefixPath, compressionLevel, inMemory }?: MakeArchiveFromDirectoryOptions): Promise<ZipFS>;
interface ExtractBufferOptions {
    compressionLevel?: ZipCompression;
    prefixPath?: PortablePath;
    stripComponents?: number;
}
export declare function convertToZip(tgz: Buffer, opts: ExtractBufferOptions): Promise<ZipFS>;
export declare function extractArchiveTo<T extends FakeFS<PortablePath>>(tgz: Buffer, targetFs: T, { stripComponents, prefixPath }?: ExtractBufferOptions): Promise<T>;
export {};
