import { IStateDB } from '@jupyterlab/coreutils';
import { CommandRegistry } from '@phosphor/commands';
import { ReadonlyJSONObject } from '@phosphor/coreutils';
import { IDisposable } from '@phosphor/disposable';
import { ISignal } from '@phosphor/signaling';
import { Widget } from '@phosphor/widgets';
/**
 * An object that tracks widget instances.
 */
export interface IInstanceTracker<T extends Widget> extends IDisposable {
    /**
     * A signal emitted when the current widget changes.
     *
     * #### Notes
     * If the last widget being tracked is disposed, `null` will be emitted.
     */
    readonly currentChanged: ISignal<this, T | null>;
    /**
     * A signal emitted when a widget is added.
     *
     * #### Notes
     * This signal will only fire when a widget is added to the tracker. It will
     * not fire if a widget is injected into the tracker.
     */
    readonly widgetAdded: ISignal<this, T>;
    /**
     * The current widget is the most recently focused or added widget.
     *
     * #### Notes
     * It is the most recently focused widget, or the most recently added
     * widget if no widget has taken focus.
     */
    readonly currentWidget: T | null;
    /**
     * The number of widgets held by the tracker.
     */
    readonly size: number;
    /**
     * Find the first widget in the tracker that satisfies a filter function.
     *
     * @param - fn The filter function to call on each widget.
     *
     * #### Notes
     * If no widget is found, the value returned is `undefined`.
     */
    find(fn: (widget: T) => boolean): T | undefined;
    /**
     * Iterate through each widget in the tracker.
     *
     * @param fn - The function to call on each widget.
     */
    forEach(fn: (widget: T) => void): void;
    /**
     * Filter the widgets in the tracker based on a predicate.
     *
     * @param fn - The function by which to filter.
     */
    filter(fn: (widget: T) => boolean): T[];
    /**
     * Check if this tracker has the specified widget.
     *
     * @param widget - The widget whose existence is being checked.
     */
    has(widget: Widget): boolean;
    /**
     * Inject a foreign widget into the instance tracker.
     *
     * @param widget - The widget to inject into the tracker.
     *
     * #### Notes
     * Any widgets injected into an instance tracker will not have their state
     * saved by the tracker. The primary use case for widget injection is for a
     * plugin that offers a sub-class of an extant plugin to have its instances
     * share the same commands as the parent plugin (since most relevant commands
     * will use the `currentWidget` of the parent plugin's instance tracker). In
     * this situation, the sub-class plugin may well have its own instance tracker
     * for layout and state restoration in addition to injecting its widgets into
     * the parent plugin's instance tracker.
     */
    inject(widget: T): void;
}
/**
 * A class that keeps track of widget instances on an Application shell.
 *
 * #### Notes
 * The API surface area of this concrete implementation is substantially larger
 * than the instance tracker interface it implements. The interface is intended
 * for export by JupyterLab plugins that create widgets and have clients who may
 * wish to keep track of newly created widgets. This class, however, can be used
 * internally by plugins to restore state as well.
 */
export declare class InstanceTracker<T extends Widget> implements IInstanceTracker<T>, IDisposable {
    /**
     * Create a new instance tracker.
     *
     * @param options - The instantiation options for an instance tracker.
     */
    constructor(options: InstanceTracker.IOptions);
    /**
     * A signal emitted when the current widget changes.
     */
    readonly currentChanged: ISignal<this, T | null>;
    /**
     * A signal emitted when a widget is added.
     *
     * #### Notes
     * This signal will only fire when a widget is added to the tracker. It will
     * not fire if a widget is injected into the tracker.
     */
    readonly widgetAdded: ISignal<this, T>;
    /**
     * A signal emitted when a widget is updated.
     */
    readonly widgetUpdated: ISignal<this, T>;
    /**
     * A namespace for all tracked widgets, (e.g., `notebook`).
     */
    readonly namespace: string;
    /**
     * The current widget is the most recently focused or added widget.
     *
     * #### Notes
     * It is the most recently focused widget, or the most recently added
     * widget if no widget has taken focus.
     */
    readonly currentWidget: T | null;
    /**
     * The number of widgets held by the tracker.
     */
    readonly size: number;
    /**
     * Add a new widget to the tracker.
     *
     * @param widget - The widget being added.
     */
    add(widget: T): Promise<void>;
    /**
     * Test whether the tracker is disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resources held by the tracker.
     */
    dispose(): void;
    /**
     * Find the first widget in the tracker that satisfies a filter function.
     *
     * @param - fn The filter function to call on each widget.
     *
     * #### Notes
     * If no widget is found, the value returned is `undefined`.
     */
    find(fn: (widget: T) => boolean): T | undefined;
    /**
     * Iterate through each widget in the tracker.
     *
     * @param fn - The function to call on each widget.
     */
    forEach(fn: (widget: T) => void): void;
    /**
     * Filter the widgets in the tracker based on a predicate.
     *
     * @param fn - The function by which to filter.
     */
    filter(fn: (widget: T) => boolean): T[];
    /**
     * Inject a foreign widget into the instance tracker.
     *
     * @param widget - The widget to inject into the tracker.
     *
     * #### Notes
     * Any widgets injected into an instance tracker will not have their state
     * saved by the tracker. The primary use case for widget injection is for a
     * plugin that offers a sub-class of an extant plugin to have its instances
     * share the same commands as the parent plugin (since most relevant commands
     * will use the `currentWidget` of the parent plugin's instance tracker). In
     * this situation, the sub-class plugin may well have its own instance tracker
     * for layout and state restoration in addition to injecting its widgets into
     * the parent plugin's instance tracker.
     */
    inject(widget: T): void;
    /**
     * Check if this tracker has the specified widget.
     *
     * @param widget - The widget whose existence is being checked.
     */
    has(widget: Widget): boolean;
    /**
     * Restore the widgets in this tracker's namespace.
     *
     * @param options - The configuration options that describe restoration.
     *
     * @returns A promise that resolves when restoration has completed.
     *
     * #### Notes
     * This function should almost never be invoked by client code. Its primary
     * use case is to be invoked by a layout restorer plugin that handles
     * multiple instance trackers and, when ready, asks them each to restore their
     * respective widgets.
     */
    restore(options: InstanceTracker.IRestoreOptions<T>): Promise<any>;
    /**
     * Save the restore data for a given widget.
     *
     * @param widget - The widget being saved.
     */
    save(widget: T): void;
    /**
     * Handle the current change event.
     *
     * #### Notes
     * The default implementation is a no-op.
     */
    protected onCurrentChanged(value: T | null): void;
    /**
     * Handle the current change signal from the internal focus tracker.
     */
    private _onCurrentChanged;
    /**
     * Clean up after disposed widgets.
     */
    private _onWidgetDisposed;
    private _restore;
    private _tracker;
    private _currentChanged;
    private _widgetAdded;
    private _widgetUpdated;
    private _widgets;
    private _currentWidget;
    private _isDisposed;
}
/**
 * A namespace for `InstanceTracker` statics.
 */
export declare namespace InstanceTracker {
    /**
     * The instantiation options for an instance tracker.
     */
    interface IOptions {
        /**
         * A namespace for all tracked widgets, (e.g., `notebook`).
         */
        namespace: string;
    }
    /**
     * The state restoration configuration options.
     */
    interface IRestoreOptions<T extends Widget> {
        /**
         * The command to execute when restoring instances.
         */
        command: string;
        /**
         * A function that returns the args needed to restore an instance.
         */
        args: (widget: T) => ReadonlyJSONObject;
        /**
         * A function that returns a unique persistent name for this instance.
         */
        name: (widget: T) => string;
        /**
         * The command registry which holds the restore command.
         */
        registry: CommandRegistry;
        /**
         * The state database instance.
         */
        state: IStateDB;
        /**
         * The point after which it is safe to restore state.
         *
         * #### Notes
         * By definition, this promise or promises will happen after the application
         * has `started`.
         */
        when?: Promise<any> | Array<Promise<any>>;
    }
}
