"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const webpack = __importStar(require("webpack"));
const build_1 = require("./build");
const webpack_plugins_1 = require("./webpack-plugins");
const webpack_merge_1 = require("webpack-merge");
const fs = __importStar(require("fs-extra"));
const glob = __importStar(require("glob"));
const ajv_1 = __importDefault(require("ajv"));
const buildutils_1 = require("@jupyterlab/buildutils");
const baseConfig = require('./webpack.config.base');
const { ModuleFederationPlugin } = webpack.container;
function generateConfig({ packagePath = '', corePath = '', staticUrl = '', mode = 'production', devtool = mode === 'development' ? 'source-map' : undefined, watchMode = false } = {}) {
    var _a, _b, _c;
    const data = require(path.join(packagePath, 'package.json'));
    const ajv = new ajv_1.default({ useDefaults: true });
    const validate = ajv.compile(require('../metadata_schema.json'));
    let valid = validate((_a = data.jupyterlab) !== null && _a !== void 0 ? _a : {});
    if (!valid) {
        console.error(validate.errors);
        process.exit(1);
    }
    const outputPath = path.join(packagePath, data.jupyterlab['outputDir']);
    const staticPath = path.join(outputPath, 'static');
    // Handle the extension entry point and the lib entry point, if different
    const index = require.resolve(packagePath);
    const exposes = {
        './index': index
    };
    const extension = data.jupyterlab.extension;
    if (extension === true) {
        exposes['./extension'] = index;
    }
    else if (typeof extension === 'string') {
        exposes['./extension'] = path.join(packagePath, extension);
    }
    const mimeExtension = data.jupyterlab.mimeExtension;
    if (mimeExtension === true) {
        exposes['./mimeExtension'] = index;
    }
    else if (typeof mimeExtension === 'string') {
        exposes['./mimeExtension'] = path.join(packagePath, mimeExtension);
    }
    if (typeof data.styleModule === 'string') {
        exposes['./style'] = path.join(packagePath, data.styleModule);
    }
    else if (typeof data.style === 'string') {
        exposes['./style'] = path.join(packagePath, data.style);
    }
    const coreData = require(path.join(corePath, 'package.json'));
    let shared = {};
    // Start with core package versions.
    const coreDeps = Object.assign(Object.assign({}, coreData.dependencies), ((_b = coreData.resolutions) !== null && _b !== void 0 ? _b : {}));
    // Alow extensions to match a wider range than the core dependency
    // To ensure forward compatibility.
    Object.keys(coreDeps).forEach(element => {
        shared[element] = {
            requiredVersion: coreDeps[element].replace('~', '^'),
            import: false
        };
    });
    // Add package dependencies.
    Object.keys(data.dependencies).forEach(element => {
        // TODO: make sure that the core dependency semver range is a subset of our
        // data.depencies version range for any packages in the core deps.
        if (!shared[element]) {
            shared[element] = {};
        }
    });
    // Set core packages as singletons that are not bundled.
    coreData.jupyterlab.singletonPackages.forEach((element) => {
        if (!shared[element]) {
            shared[element] = {};
        }
        shared[element].import = false;
        shared[element].singleton = true;
    });
    // Now we merge in the sharedPackages configuration provided by the extension.
    const sharedPackages = (_c = data.jupyterlab.sharedPackages) !== null && _c !== void 0 ? _c : {};
    // Delete any modules that are explicitly not shared
    Object.keys(sharedPackages).forEach(pkg => {
        if (sharedPackages[pkg] === false) {
            delete shared[pkg];
            delete sharedPackages[pkg];
        }
    });
    // Transform the sharedPackages information into valid webpack config
    Object.keys(sharedPackages).forEach(pkg => {
        var _a;
        // Convert `bundled` to `import`
        if (sharedPackages[pkg].bundled === false) {
            sharedPackages[pkg].import = false;
        }
        else if (sharedPackages[pkg].bundled === true &&
            ((_a = shared[pkg]) === null || _a === void 0 ? void 0 : _a.import) === false) {
            // We can't delete a key in the merge, so we have to delete it in the source
            delete shared[pkg].import;
        }
        delete sharedPackages[pkg].bundled;
    });
    shared = webpack_merge_1.merge(shared, sharedPackages);
    // add the root module itself to shared
    if (shared[data.name]) {
        console.error(`The root package itself '${data.name}' may not specified as a shared dependency.`);
    }
    shared[data.name] = {
        version: data.version,
        singleton: true,
        import: index
    };
    // Ensure a clean output directory - remove files but not the directory
    // in case it is a symlink
    fs.emptyDirSync(outputPath);
    const extras = build_1.Build.ensureAssets({
        packageNames: [],
        packagePaths: [packagePath],
        output: staticPath,
        schemaOutput: outputPath,
        themeOutput: outputPath
    });
    fs.copyFileSync(path.join(packagePath, 'package.json'), path.join(outputPath, 'package.json'));
    class CleanupPlugin {
        apply(compiler) {
            compiler.hooks.done.tap('Cleanup', (stats) => {
                const newlyCreatedAssets = stats.compilation.assets;
                // Clear out any remoteEntry files that are stale
                // https://stackoverflow.com/a/40370750
                const files = glob.sync(path.join(staticPath, 'remoteEntry.*.js'));
                let newEntry = '';
                const unlinked = [];
                files.forEach(file => {
                    const fileName = path.basename(file);
                    if (!newlyCreatedAssets[fileName]) {
                        fs.unlinkSync(path.resolve(file));
                        unlinked.push(fileName);
                    }
                    else {
                        newEntry = fileName;
                    }
                });
                if (unlinked.length > 0) {
                    console.log('Removed old assets: ', unlinked);
                }
                // Find the remoteEntry file and add it to the package.json metadata
                const data = buildutils_1.readJSONFile(path.join(outputPath, 'package.json'));
                const _build = {
                    load: path.join('static', newEntry)
                };
                if (exposes['./extension'] !== undefined) {
                    _build.extension = './extension';
                }
                if (exposes['./mimeExtension'] !== undefined) {
                    _build.mimeExtension = './mimeExtension';
                }
                if (exposes['./style'] !== undefined) {
                    _build.style = './style';
                }
                data.jupyterlab._build = _build;
                buildutils_1.writeJSONFile(path.join(outputPath, 'package.json'), data);
            });
        }
    }
    // Allow custom webpack config
    let webpackConfigPath = data.jupyterlab['webpackConfig'];
    let webpackConfig = {};
    // Use the custom webpack config only if the path to the config
    // is specified in package.json (opt-in)
    if (webpackConfigPath) {
        webpackConfigPath = path.join(packagePath, webpackConfigPath);
        if (fs.existsSync(webpackConfigPath)) {
            webpackConfig = require(webpackConfigPath);
        }
    }
    let plugins = [
        new ModuleFederationPlugin({
            name: data.name,
            library: {
                type: 'var',
                name: ['_JUPYTERLAB', data.name]
            },
            filename: 'remoteEntry.[contenthash].js',
            exposes,
            shared
        }),
        new CleanupPlugin()
    ];
    if (mode === 'production') {
        plugins.push(new webpack_plugins_1.WPPlugin.JSONLicenseWebpackPlugin({
            excludedPackageTest: packageName => packageName === data.name
        }));
    }
    // Add version argument when in production so the Jupyter server
    // allows caching of files (i.e., does not set the CacheControl header to no-cache to prevent caching static files)
    let filename = '[name].[contenthash].js';
    if (mode === 'production') {
        filename += '?v=[contenthash]';
    }
    const config = [
        webpack_merge_1.merge(baseConfig, {
            mode,
            devtool,
            entry: {},
            output: {
                filename,
                path: staticPath,
                publicPath: staticUrl || 'auto'
            },
            module: {
                rules: [{ test: /\.html$/, use: 'file-loader' }]
            },
            plugins
        }, webpackConfig)
    ].concat(extras);
    if (mode === 'development') {
        const logPath = path.join(outputPath, 'build_log.json');
        fs.writeFileSync(logPath, JSON.stringify(config, null, '  '));
    }
    return config;
}
exports.default = generateConfig;
//# sourceMappingURL=extensionConfig.js.map