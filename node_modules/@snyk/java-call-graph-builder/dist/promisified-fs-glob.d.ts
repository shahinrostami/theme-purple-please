/// <reference types="node" />
import * as fs from 'fs';
import * as globOrig from 'glob';
export declare const exists: typeof fs.exists.__promisify__;
export declare const rename: typeof fs.rename.__promisify__;
export declare const unlink: typeof fs.unlink.__promisify__;
export declare const mkdir: typeof fs.mkdir.__promisify__;
export declare const mkdtemp: typeof fs.mkdtemp.__promisify__;
export declare const readFile: typeof fs.readFile.__promisify__;
export declare const writeFile: typeof fs.writeFile.__promisify__;
export declare const rmdir: typeof fs.rmdir.__promisify__;
export declare const glob: typeof globOrig.__promisify__;
