"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
const minimist_1 = __importDefault(require("minimist"));
const path_1 = require("./path");
const url_1 = require("./url");
/**
 * The namespace for Page Config functions.
 */
var PageConfig;
(function (PageConfig) {
    /**
     * Get global configuration data for the Jupyter application.
     *
     * @param name - The name of the configuration option.
     *
     * @returns The config value or an empty string if not found.
     *
     * #### Notes
     * All values are treated as strings.
     * For browser based applications, it is assumed that the page HTML
     * includes a script tag with the id `jupyter-config-data` containing the
     * configuration as valid JSON.  In order to support the classic Notebook,
     * we fall back on checking for `body` data of the given `name`.
     *
     * For node applications, it is assumed that the process was launched
     * with a `--jupyter-config-data` option pointing to a JSON settings
     * file.
     */
    function getOption(name) {
        if (configData) {
            return configData[name] || Private.getBodyData(name);
        }
        configData = Object.create(null);
        let found = false;
        // Use script tag if available.
        if (typeof document !== 'undefined') {
            const el = document.getElementById('jupyter-config-data');
            if (el) {
                configData = JSON.parse(el.textContent || '');
                found = true;
            }
        }
        // Otherwise use CLI if given.
        if (!found && typeof process !== 'undefined') {
            try {
                const cli = minimist_1.default(process.argv.slice(2));
                const path = require('path');
                let fullPath = '';
                if ('jupyter-config-data' in cli) {
                    fullPath = path.resolve(cli['jupyter-config-data']);
                }
                else if ('JUPYTER_CONFIG_DATA' in process.env) {
                    fullPath = path.resolve(process.env['JUPYTER_CONFIG_DATA']);
                }
                if (fullPath) {
                    /* tslint:disable */
                    // Force Webpack to ignore this require.
                    configData = eval('require')(fullPath);
                    /* tslint:enable */
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        if (!coreutils_1.JSONExt.isObject(configData)) {
            configData = Object.create(null);
        }
        else {
            for (let key in configData) {
                // Quote characters are escaped, unescape them.
                configData[key] = String(configData[key])
                    .split('&#39;')
                    .join('"');
            }
        }
        return configData[name] || '';
    }
    PageConfig.getOption = getOption;
    /**
     * Set global configuration data for the Jupyter application.
     *
     * @param name - The name of the configuration option.
     * @param value - The value to set the option to.
     *
     * @returns The last config value or an empty string if it doesn't exist.
     */
    function setOption(name, value) {
        const last = getOption(name);
        configData[name] = value;
        return last;
    }
    PageConfig.setOption = setOption;
    /**
     * Get the base url for a Jupyter application, or the base url of the page.
     */
    function getBaseUrl() {
        return url_1.URLExt.normalize(getOption('baseUrl') || '/');
    }
    PageConfig.getBaseUrl = getBaseUrl;
    /**
     * Get the tree url for a JupyterLab application.
     *
     * @param options - The tree URL construction options.
     */
    function getTreeUrl(options = {}) {
        const base = getBaseUrl();
        const tree = getOption('treeUrl');
        const defaultWorkspace = getOption('defaultWorkspace');
        const workspaces = getOption('workspacesUrl');
        const workspace = getOption('workspace');
        return !!options.workspace && workspace && workspace !== defaultWorkspace
            ? url_1.URLExt.join(base, workspaces, path_1.PathExt.basename(workspace), 'tree')
            : url_1.URLExt.join(base, tree);
    }
    PageConfig.getTreeUrl = getTreeUrl;
    /**
     * Get the base websocket url for a Jupyter application, or an empty string.
     */
    function getWsUrl(baseUrl) {
        let wsUrl = getOption('wsUrl');
        if (!wsUrl) {
            baseUrl = baseUrl ? url_1.URLExt.normalize(baseUrl) : getBaseUrl();
            if (baseUrl.indexOf('http') !== 0) {
                return '';
            }
            wsUrl = 'ws' + baseUrl.slice(4);
        }
        return url_1.URLExt.normalize(wsUrl);
    }
    PageConfig.getWsUrl = getWsUrl;
    /**
     * Get the authorization token for a Jupyter application.
     */
    function getToken() {
        return getOption('token') || Private.getBodyData('jupyterApiToken');
    }
    PageConfig.getToken = getToken;
    /**
     * Get the Notebook version info [major, minor, patch].
     */
    function getNotebookVersion() {
        const notebookVersion = getOption('notebookVersion');
        if (notebookVersion === '') {
            return [0, 0, 0];
        }
        return JSON.parse(notebookVersion);
    }
    PageConfig.getNotebookVersion = getNotebookVersion;
    /**
     * Private page config data for the Jupyter application.
     */
    let configData = null;
})(PageConfig = exports.PageConfig || (exports.PageConfig = {}));
/**
 * A namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * Get a url-encoded item from `body.data` and decode it
     * We should never have any encoded URLs anywhere else in code
     * until we are building an actual request.
     */
    function getBodyData(key) {
        if (typeof document === 'undefined' || !document.body) {
            return '';
        }
        let val = document.body.dataset[key];
        if (typeof val === 'undefined') {
            return '';
        }
        return decodeURIComponent(val);
    }
    Private.getBodyData = getBodyData;
})(Private || (Private = {}));
