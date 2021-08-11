/**
 * Ensure the integrity of a package.
 *
 * @param options - The options used to ensure the package.
 *
 * @returns A list of changes that were made to ensure the package.
 */
export declare function ensurePackage(options: IEnsurePackageOptions): Promise<string[]>;
/**
 * An extra ensure function just for the @jupyterlab/ui-components package.
 * Ensures that the icon svg import statements are synced with the contents
 * of ui-components/style/icons.
 *
 * @param pkgPath - The path to the @jupyterlab/ui-components package.
 * @param dorequire - If true, use `require` function in place of `import`
 *  statements when loading the icon svg files
 *
 * @returns A list of changes that were made to ensure the package.
 */
export declare function ensureUiComponents(pkgPath: string, dorequire?: boolean): Promise<string[]>;
/**
 * The options used to ensure a package.
 */
export interface IEnsurePackageOptions {
    /**
     * The path to the package.
     */
    pkgPath: string;
    /**
     * The package data.
     */
    data: any;
    /**
     * The cache of dependency versions by package.
     */
    depCache?: {
        [key: string]: string;
    };
    /**
     * A list of dependencies that can be unused.
     */
    unused?: string[];
    /**
     * A list of dependencies that can be missing.
     */
    missing?: string[];
    /**
     * A map of local package names and their relative path.
     */
    locals?: {
        [key: string]: string;
    };
    /**
     * Whether to enforce that dependencies get used.  Default is true.
     */
    noUnused?: boolean;
    /**
     * The css import list for the package.
     */
    cssImports?: string[];
    /**
     * The css module import list for the package.
     */
    cssModuleImports?: string[];
    /**
     * Packages which are allowed to have multiple versions pulled in
     */
    differentVersions?: string[];
}
