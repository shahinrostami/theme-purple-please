import * as resolveNodeDeps from 'snyk-resolve-deps';
import { Options } from '../types';
export declare function parse(root: string, targetFile: string, options: Options): Promise<resolveNodeDeps.PackageExpanded>;
