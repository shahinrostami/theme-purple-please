"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
// Local CSS must be loaded prior to loading other libs.
require("../style/index.css");
const coreutils_1 = require("@jupyterlab/coreutils");
const apputils_1 = require("@jupyterlab/apputils");
const docregistry_1 = require("@jupyterlab/docregistry");
const services_1 = require("@jupyterlab/services");
const application_1 = require("@phosphor/application");
const disposable_1 = require("@phosphor/disposable");
const mimerenderers_1 = require("./mimerenderers");
const shell_1 = require("./shell");
const signaling_1 = require("@phosphor/signaling");
var layoutrestorer_1 = require("./layoutrestorer");
exports.ILayoutRestorer = layoutrestorer_1.ILayoutRestorer;
exports.LayoutRestorer = layoutrestorer_1.LayoutRestorer;
var mimerenderers_2 = require("./mimerenderers");
exports.IMimeDocumentTracker = mimerenderers_2.IMimeDocumentTracker;
var router_1 = require("./router");
exports.IRouter = router_1.IRouter;
exports.Router = router_1.Router;
var shell_2 = require("./shell");
exports.ApplicationShell = shell_2.ApplicationShell;
/**
 * JupyterLab is the main application class. It is instantiated once and shared.
 */
class JupyterLab extends application_1.Application {
    /**
     * Construct a new JupyterLab object.
     */
    constructor(options = {}) {
        super({ shell: new shell_1.ApplicationShell() });
        /**
         * A list of all errors encountered when registering plugins.
         */
        this.registerPluginErrors = [];
        this._dirtyCount = 0;
        this._busyCount = 0;
        this._busySignal = new signaling_1.Signal(this);
        this._dirtySignal = new signaling_1.Signal(this);
        // Construct the default workspace name.
        const defaultWorkspace = coreutils_1.URLExt.join(coreutils_1.PageConfig.getOption('baseUrl'), coreutils_1.PageConfig.getOption('pageUrl'));
        // Set default workspace in page config.
        coreutils_1.PageConfig.setOption('defaultWorkspace', defaultWorkspace);
        // Instantiate public resources.
        this.serviceManager = options.serviceManager || new services_1.ServiceManager();
        this.commandLinker =
            options.commandLinker || new apputils_1.CommandLinker({ commands: this.commands });
        this.docRegistry = options.docRegistry || new docregistry_1.DocumentRegistry();
        // Remove extra resources (non-IInfo) from options object.
        delete options.serviceManager;
        delete options.commandLinker;
        delete options.docRegistry;
        // Populate application info.
        this._info = Object.assign({}, JupyterLab.defaultInfo, options, { defaultWorkspace });
        if (this._info.devMode) {
            this.shell.addClass('jp-mod-devMode');
        }
        // Make workspace accessible via a getter because it is set at runtime.
        Object.defineProperty(this._info, 'workspace', {
            get: () => coreutils_1.PageConfig.getOption('workspace') || ''
        });
        // Add initial model factory.
        this.docRegistry.addModelFactory(new docregistry_1.Base64ModelFactory());
        if (options.mimeExtensions) {
            for (let plugin of mimerenderers_1.createRendermimePlugins(options.mimeExtensions)) {
                this.registerPlugin(plugin);
            }
        }
    }
    /**
     * A method invoked on a document `'contextmenu'` event.
     *
     * #### Notes
     * The default implementation of this method opens the application
     * `contextMenu` at the current mouse position.
     *
     * If the application context menu has no matching content *or* if
     * the shift key is pressed, the default browser context menu will
     * be opened instead.
     *
     * A subclass may reimplement this method as needed.
     */
    evtContextMenu(event) {
        if (event.shiftKey) {
            return;
        }
        this._contextMenuEvent = event;
        if (this.contextMenu.open(event)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
    /**
     * Whether the application is dirty.
     */
    get isDirty() {
        return this._dirtyCount > 0;
    }
    /**
     * Whether the application is busy.
     */
    get isBusy() {
        return this._busyCount > 0;
    }
    /**
     * Returns a signal for when application changes its busy status.
     */
    get busySignal() {
        return this._busySignal;
    }
    /**
     * Returns a signal for when application changes its dirty status.
     */
    get dirtySignal() {
        return this._dirtySignal;
    }
    /**
     * The information about the application.
     */
    get info() {
        return this._info;
    }
    /**
     * Promise that resolves when state is first restored, returning layout description.
     *
     * #### Notes
     * This is just a reference to `shell.restored`.
     */
    get restored() {
        return this.shell.restored;
    }
    /**
     * Walks up the DOM hierarchy of the target of the active `contextmenu`
     * event, testing the nodes for a user-supplied funcion. This can
     * be used to find a node on which to operate, given a context menu click.
     *
     * @param test - a function that takes an `HTMLElement` and returns a
     *   boolean for whether it is the element the requester is seeking.
     *
     * @returns an HTMLElement or undefined, if none is found.
     */
    contextMenuFirst(test) {
        for (let node of this._getContextMenuNodes()) {
            if (test(node)) {
                return node;
            }
        }
        return undefined;
    }
    /**
     * Set the application state to dirty.
     *
     * @returns A disposable used to clear the dirty state for the caller.
     */
    setDirty() {
        const oldDirty = this.isDirty;
        this._dirtyCount++;
        if (this.isDirty !== oldDirty) {
            this._dirtySignal.emit(this.isDirty);
        }
        return new disposable_1.DisposableDelegate(() => {
            const oldDirty = this.isDirty;
            this._dirtyCount = Math.max(0, this._dirtyCount - 1);
            if (this.isDirty !== oldDirty) {
                this._dirtySignal.emit(this.isDirty);
            }
        });
    }
    /**
     * Set the application state to busy.
     *
     * @returns A disposable used to clear the busy state for the caller.
     */
    setBusy() {
        const oldBusy = this.isBusy;
        this._busyCount++;
        if (this.isBusy !== oldBusy) {
            this._busySignal.emit(this.isBusy);
        }
        return new disposable_1.DisposableDelegate(() => {
            const oldBusy = this.isBusy;
            this._busyCount--;
            if (this.isBusy !== oldBusy) {
                this._busySignal.emit(this.isBusy);
            }
        });
    }
    /**
     * Register plugins from a plugin module.
     *
     * @param mod - The plugin module to register.
     */
    registerPluginModule(mod) {
        let data = mod.default;
        // Handle commonjs exports.
        if (!mod.hasOwnProperty('__esModule')) {
            data = mod;
        }
        if (!Array.isArray(data)) {
            data = [data];
        }
        data.forEach(item => {
            try {
                this.registerPlugin(item);
            }
            catch (error) {
                this.registerPluginErrors.push(error);
            }
        });
    }
    /**
     * Register the plugins from multiple plugin modules.
     *
     * @param mods - The plugin modules to register.
     */
    registerPluginModules(mods) {
        mods.forEach(mod => {
            this.registerPluginModule(mod);
        });
    }
    /**
     * Gets the hierarchy of html nodes that was under the cursor
     * when the most recent contextmenu event was issued
     */
    _getContextMenuNodes() {
        if (!this._contextMenuEvent) {
            return [];
        }
        // this one-liner doesn't work, but should at some point
        // in the future (https://developer.mozilla.org/en-US/docs/Web/API/Event)
        // return this._contextMenuEvent.composedPath() as HTMLElement[];
        let nodes = [this._contextMenuEvent.target];
        while ('parentNode' in nodes[nodes.length - 1] &&
            nodes[nodes.length - 1].parentNode &&
            nodes[nodes.length - 1] !== nodes[nodes.length - 1].parentNode) {
            nodes.push(nodes[nodes.length - 1].parentNode);
        }
        return nodes;
    }
}
exports.JupyterLab = JupyterLab;
/**
 * The namespace for `JupyterLab` class statics.
 */
(function (JupyterLab) {
    /**
     * The default application info.
     */
    JupyterLab.defaultInfo = {
        name: coreutils_1.PageConfig.getOption('appName') || 'JupyterLab',
        namespace: coreutils_1.PageConfig.getOption('appNamespace'),
        version: coreutils_1.PageConfig.getOption('appVersion') || 'unknown',
        devMode: coreutils_1.PageConfig.getOption('devMode').toLowerCase() === 'true',
        deferred: { patterns: [], matches: [] },
        disabled: { patterns: [], matches: [] },
        mimeExtensions: [],
        urls: {
            base: coreutils_1.PageConfig.getOption('baseUrl'),
            page: coreutils_1.PageConfig.getOption('pageUrl'),
            public: coreutils_1.PageConfig.getOption('publicUrl'),
            settings: coreutils_1.PageConfig.getOption('settingsUrl'),
            themes: coreutils_1.PageConfig.getOption('themesUrl'),
            tree: coreutils_1.PageConfig.getOption('treeUrl'),
            workspaces: coreutils_1.PageConfig.getOption('workspacesUrl')
        },
        directories: {
            appSettings: coreutils_1.PageConfig.getOption('appSettingsDir'),
            schemas: coreutils_1.PageConfig.getOption('schemasDir'),
            static: coreutils_1.PageConfig.getOption('staticDir'),
            templates: coreutils_1.PageConfig.getOption('templatesDir'),
            themes: coreutils_1.PageConfig.getOption('themesDir'),
            userSettings: coreutils_1.PageConfig.getOption('userSettingsDir'),
            serverRoot: coreutils_1.PageConfig.getOption('serverRoot'),
            workspaces: coreutils_1.PageConfig.getOption('workspacesDir')
        },
        filesCached: coreutils_1.PageConfig.getOption('cacheFiles').toLowerCase() === 'true',
        workspace: '',
        defaultWorkspace: ''
    };
})(JupyterLab = exports.JupyterLab || (exports.JupyterLab = {}));
