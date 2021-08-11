import * as webpack from 'webpack';
/**
 *  A namespace for JupyterLab build utilities.
 */
export declare namespace Build {
    /**
     * The options used to ensure a root package has the appropriate
     * assets for its JupyterLab extension packages.
     */
    interface IEnsureOptions {
        /**
         * The output directory where the build assets should reside.
         */
        output: string;
        /**
         * The directory for the schema directory, defaults to the output directory.
         */
        schemaOutput?: string;
        /**
         * The directory for the theme directory, defaults to the output directory
         */
        themeOutput?: string;
        /**
         * The names of the packages to ensure.
         */
        packageNames: ReadonlyArray<string>;
        /**
         * The package paths to ensure.
         */
        packagePaths?: ReadonlyArray<string>;
    }
    /**
     * The JupyterLab extension attributes in a module.
     */
    interface ILabExtension {
        /**
         * Indicates whether the extension is a standalone extension.
         *
         * #### Notes
         * If `true`, the `main` export of the package is used. If set to a string
         * path, the export from that path is loaded as a JupyterLab extension. It
         * is possible for one package to have both an `extension` and a
         * `mimeExtension` but they cannot be identical (i.e., the same export
         * cannot be declared both an `extension` and a `mimeExtension`).
         */
        readonly extension?: boolean | string;
        /**
         * Indicates whether the extension is a MIME renderer extension.
         *
         * #### Notes
         * If `true`, the `main` export of the package is used. If set to a string
         * path, the export from that path is loaded as a JupyterLab extension. It
         * is possible for one package to have both an `extension` and a
         * `mimeExtension` but they cannot be identical (i.e., the same export
         * cannot be declared both an `extension` and a `mimeExtension`).
         */
        readonly mimeExtension?: boolean | string;
        /**
         * The local schema file path in the extension package.
         */
        readonly schemaDir?: string;
        /**
         * The local theme file path in the extension package.
         */
        readonly themePath?: string;
    }
    /**
     * A minimal definition of a module's package definition (i.e., package.json).
     */
    interface IModule {
        /**
         * The JupyterLab metadata/
         */
        jupyterlab?: ILabExtension;
        /**
         * The main entry point in a module.
         */
        main?: string;
        /**
         * The name of a module.
         */
        name: string;
    }
    /**
     * Ensures that the assets of plugin packages are populated for a build.
     *
     * @ Returns An array of lab extension config data.
     */
    function ensureAssets(options: IEnsureOptions): webpack.Configuration[];
    /**
     * Returns JupyterLab extension metadata from a module.
     */
    function normalizeExtension(module: IModule): ILabExtension;
}
