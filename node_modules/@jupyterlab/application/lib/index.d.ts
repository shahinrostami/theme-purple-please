import '../style/index.css';
import { CommandLinker } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { ServiceManager } from '@jupyterlab/services';
import { Application, IPlugin } from '@phosphor/application';
import { IDisposable } from '@phosphor/disposable';
import { ApplicationShell } from './shell';
import { ISignal } from '@phosphor/signaling';
export { ILayoutRestorer, LayoutRestorer } from './layoutrestorer';
export { IMimeDocumentTracker } from './mimerenderers';
export { IRouter, Router } from './router';
export { ApplicationShell } from './shell';
/**
 * The type for all JupyterLab plugins.
 */
export declare type JupyterLabPlugin<T> = IPlugin<JupyterLab, T>;
/**
 * JupyterLab is the main application class. It is instantiated once and shared.
 */
export declare class JupyterLab extends Application<ApplicationShell> {
    /**
     * Construct a new JupyterLab object.
     */
    constructor(options?: JupyterLab.IOptions);
    /**
     * The document registry instance used by the application.
     */
    readonly docRegistry: DocumentRegistry;
    /**
     * The command linker used by the application.
     */
    readonly commandLinker: CommandLinker;
    /**
     * The service manager used by the application.
     */
    readonly serviceManager: ServiceManager;
    /**
     * A list of all errors encountered when registering plugins.
     */
    readonly registerPluginErrors: Array<Error>;
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
    protected evtContextMenu(event: MouseEvent): void;
    /**
     * Whether the application is dirty.
     */
    readonly isDirty: boolean;
    /**
     * Whether the application is busy.
     */
    readonly isBusy: boolean;
    /**
     * Returns a signal for when application changes its busy status.
     */
    readonly busySignal: ISignal<JupyterLab, boolean>;
    /**
     * Returns a signal for when application changes its dirty status.
     */
    readonly dirtySignal: ISignal<JupyterLab, boolean>;
    /**
     * The information about the application.
     */
    readonly info: JupyterLab.IInfo;
    /**
     * Promise that resolves when state is first restored, returning layout description.
     *
     * #### Notes
     * This is just a reference to `shell.restored`.
     */
    readonly restored: Promise<ApplicationShell.ILayout>;
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
    contextMenuFirst(test: (node: HTMLElement) => boolean): HTMLElement | undefined;
    /**
     * Set the application state to dirty.
     *
     * @returns A disposable used to clear the dirty state for the caller.
     */
    setDirty(): IDisposable;
    /**
     * Set the application state to busy.
     *
     * @returns A disposable used to clear the busy state for the caller.
     */
    setBusy(): IDisposable;
    /**
     * Register plugins from a plugin module.
     *
     * @param mod - The plugin module to register.
     */
    registerPluginModule(mod: JupyterLab.IPluginModule): void;
    /**
     * Register the plugins from multiple plugin modules.
     *
     * @param mods - The plugin modules to register.
     */
    registerPluginModules(mods: JupyterLab.IPluginModule[]): void;
    /**
     * Gets the hierarchy of html nodes that was under the cursor
     * when the most recent contextmenu event was issued
     */
    private _getContextMenuNodes;
    private _contextMenuEvent;
    private _info;
    private _dirtyCount;
    private _busyCount;
    private _busySignal;
    private _dirtySignal;
}
/**
 * The namespace for `JupyterLab` class statics.
 */
export declare namespace JupyterLab {
    /**
     * The options used to initialize a JupyterLab object.
     */
    interface IOptions extends Partial<IInfo> {
        /**
         * The document registry instance used by the application.
         */
        docRegistry?: DocumentRegistry;
        /**
         * The command linker used by the application.
         */
        commandLinker?: CommandLinker;
        /**
         * The service manager used by the application.
         */
        serviceManager?: ServiceManager;
    }
    /**
     * The information about a JupyterLab application.
     */
    interface IInfo {
        /**
         * The name of the JupyterLab application.
         */
        readonly name: string;
        /**
         * The version of the JupyterLab application.
         */
        readonly version: string;
        /**
         * The namespace/prefix plugins may use to denote their origin.
         */
        readonly namespace: string;
        /**
         * Whether the application is in dev mode.
         */
        readonly devMode: boolean;
        /**
         * The collection of deferred extension patterns and matched extensions.
         */
        readonly deferred: {
            patterns: string[];
            matches: string[];
        };
        /**
         * The collection of disabled extension patterns and matched extensions.
         */
        readonly disabled: {
            patterns: string[];
            matches: string[];
        };
        /**
         * The mime renderer extensions.
         */
        readonly mimeExtensions: IRenderMime.IExtensionModule[];
        /**
         * The urls used by the application.
         */
        readonly urls: {
            readonly base: string;
            readonly page: string;
            readonly public: string;
            readonly settings: string;
            readonly themes: string;
            readonly tree: string;
            readonly workspaces: string;
        };
        /**
         * The local directories used by the application.
         */
        readonly directories: {
            readonly appSettings: string;
            readonly schemas: string;
            readonly static: string;
            readonly templates: string;
            readonly themes: string;
            readonly userSettings: string;
            readonly serverRoot: string;
            readonly workspaces: string;
        };
        /**
         * Whether files are cached on the server.
         */
        readonly filesCached: boolean;
        /**
         * The name of the current workspace.
         */
        readonly workspace: string;
        /**
         * The name of the default workspace.
         */
        readonly defaultWorkspace: string;
    }
    /**
     * The default application info.
     */
    const defaultInfo: IInfo;
    /**
     * The interface for a module that exports a plugin or plugins as
     * the default value.
     */
    interface IPluginModule {
        /**
         * The default export.
         */
        default: JupyterLabPlugin<any> | JupyterLabPlugin<any>[];
    }
}
