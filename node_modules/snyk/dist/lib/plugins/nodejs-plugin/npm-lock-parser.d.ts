import { PkgTree } from 'snyk-nodejs-lockfile-parser';
import { Options } from '../types';
export declare function parse(root: string, targetFile: string, options: Options): Promise<PkgTree>;
