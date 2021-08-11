interface Package {
    name: string;
    version: string;
}
interface Options {
    loose?: boolean;
    packageManager?: string;
}
export default parsePackageString;
/**
 * Parses a string package id (name + optional version) to an object.
 *
 * This method used to be named `moduleToObject`.
 */
export declare function parsePackageString(nameAndMaybeVersion: string, versionOrOptions?: string | Options, options?: Options): Package;
export declare function encode(name: string): string;
