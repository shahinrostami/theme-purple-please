/// <reference types="node" />
import { URL } from 'url';
import { FakeFS } from './FakeFS';
import { ProxiedFS } from './ProxiedFS';
import { NativePath } from './path';
/**
 * Adds support for file URLs to the wrapped `baseFs`, but *not* inside the typings.
 *
 * Only exists for compatibility with Node's behavior.
 *
 * Automatically wraps all FS instances passed to `patchFs` & `extendFs`.
 *
 * Don't use it!
 */
export declare class URLFS extends ProxiedFS<NativePath, NativePath> {
    protected readonly baseFs: FakeFS<NativePath>;
    constructor(baseFs: FakeFS<NativePath>);
    protected mapFromBase(path: NativePath): NativePath;
    protected mapToBase(path: URL | NativePath): string;
}
