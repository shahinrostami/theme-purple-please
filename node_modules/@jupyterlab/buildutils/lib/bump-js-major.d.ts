/**
 * Get the packages that depend on a given package, recursively.
 */
export declare function getDeps(pkgName: string, lut: {
    [key: string]: {
        [key: string]: string;
    };
}): Set<string>;
