import DuplicatePackageCheckerPlugin from 'duplicate-package-checker-webpack-plugin';
import * as webpack from 'webpack';
import { LicenseWebpackPlugin } from 'license-webpack-plugin';
import { LicenseIdentifiedModule } from 'license-webpack-plugin/dist/LicenseIdentifiedModule';
import { PluginOptions } from 'license-webpack-plugin/dist/PluginOptions';
export declare namespace WPPlugin {
    /**
     * A WebPack Plugin that copies the assets to the static directory
     */
    class FrontEndPlugin {
        constructor(buildDir: string, staticDir: string);
        apply(compiler: webpack.Compiler): void;
        buildDir: string;
        staticDir: string;
        private _first;
    }
    /**
     * A WebPack Plugin that ignores files files that are filtered
     * by a callback during a `--watch` build
     */
    class FilterWatchIgnorePlugin {
        constructor(ignored: (path: string) => boolean);
        apply(compiler: webpack.Compiler): void;
        ignored: (path: string) => boolean;
    }
    class NowatchDuplicatePackageCheckerPlugin extends DuplicatePackageCheckerPlugin {
        apply(compiler: webpack.Compiler): void;
        options: DuplicatePackageCheckerPlugin.Options;
    }
    /**
     * A top-level report of the licenses for all code included in a bundle
     *
     * ### Note
     *
     * This is roughly informed by the terms defined in the SPDX spec, though is not
     * an SPDX Document, since there seem to be several (incompatible) specs
     * in that repo.
     *
     * @see https://github.com/spdx/spdx-spec/blob/development/v2.2.1/schemas/spdx-schema.json
     **/
    interface ILicenseReport {
        packages: IPackageLicenseInfo[];
    }
    /**
     * A best-effort single bundled package's information.
     *
     * ### Note
     *
     * This is roughly informed by SPDX `packages` and `hasExtractedLicenseInfos`,
     * as making it conformant would vastly complicate the structure.
     *
     * @see https://github.com/spdx/spdx-spec/blob/development/v2.2.1/schemas/spdx-schema.json
     **/
    interface IPackageLicenseInfo {
        /** the name of the package as it appears in node_modules */
        name: string;
        /** the version of the package, or an empty string if unknown */
        versionInfo: string;
        /** an SPDX license or LicenseRef, or an empty string if unknown */
        licenseId: string;
        /** the verbatim extracted text of the license, or an empty string if unknown */
        extractedText: string;
    }
    /**
     * A well-known filename for third-party license information.
     *
     * ### Note
     * If an alternate JupyterLab-based ecosystem wanted to implement a different
     * name, they may _still_ need to handle the presence of this file if reusing
     * any core files or extensions.
     *
     * If multiple files are found by `jupyterlab_server, their `packages` will
     * be concatenated.
     */
    const DEFAULT_LICENSE_REPORT_FILENAME = "third-party-licenses.json";
    /**
     * a plugin that creates a predictable, machine-readable report of licenses for
     * all modules included in this build
     */
    class JSONLicenseWebpackPlugin extends LicenseWebpackPlugin {
        constructor(pluginOptions?: PluginOptions);
        /** render an SPDX-like record */
        renderLicensesJSON(modules: LicenseIdentifiedModule[]): string;
    }
}
