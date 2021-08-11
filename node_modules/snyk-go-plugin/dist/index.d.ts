import { DepGraph } from '@snyk/dep-graph';
export interface DepDict {
    [name: string]: DepTree;
}
export interface DepTree {
    name: string;
    version?: string;
    dependencies?: DepDict;
    packageFormatVersion?: string;
    _counts?: any;
    _isProjSubpkg?: boolean;
}
interface Options {
    debug?: boolean;
    file?: string;
}
export declare function inspect(root: any, targetFile: any, options?: Options): Promise<{
    plugin: {
        name: string;
        runtime: string | undefined;
        targetFile: any;
    };
    dependencyGraph: DepGraph | undefined;
    package?: undefined;
} | {
    plugin: {
        name: string;
        runtime: string | undefined;
        targetFile: any;
    };
    package: DepTree | undefined;
    dependencyGraph?: undefined;
}>;
export declare function buildDepGraphFromImportsAndModules(root?: string, targetFile?: string): Promise<DepGraph>;
export declare function jsonParse(s: string): any;
export {};
