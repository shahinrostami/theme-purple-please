import { IDisposable } from '@lumino/disposable';
import { ISignal, Signal } from '@lumino/signaling';
import { VirtualElement } from '@lumino/virtualdom';
import { ContextMenu, Menu } from '@lumino/widgets';
/**
 * An object which implements a universal context menu.
 * Tweaked to use inline svg icons
 */
export declare class ContextMenuSvg extends ContextMenu implements IDisposable {
    /**
     * Construct a new context menu.
     *
     * @param options - The options for initializing the menu.
     */
    constructor(options: ContextMenu.IOptions);
    readonly menu: MenuSvg;
    /**
     * Test whether the context menu is disposed.
     */
    get isDisposed(): boolean;
    /**
     * A signal fired when the context menu is opened.
     */
    get opened(): ISignal<ContextMenu, void>;
    /**
     * Dispose of the resources held by the context menu.
     */
    dispose(): void;
    /**
     * Open the context menu in response to a `'contextmenu'` event.
     *
     * @param event - The `'contextmenu'` event of interest.
     *
     * @returns `true` if the menu was opened, or `false` if no items
     *   matched the event and the menu was not opened.
     *
     * #### Notes
     * This method will populate the context menu with items which match
     * the propagation path of the event, then open the menu at the mouse
     * position indicated by the event.
     */
    open(event: MouseEvent): boolean;
    protected _isDisposed: boolean;
    protected _opened: Signal<ContextMenu, void>;
}
/**
 * a widget which displays items as a canonical menu.
 * Tweaked to use inline svg icons
 */
export declare class MenuSvg extends Menu {
    /**
     * construct a new menu. Overrides the default renderer
     *
     * @param options - The options for initializing the tab bar.
     */
    constructor(options: Menu.IOptions);
    /**
     * insert a menu item into the menu at the specified index. Replaces the
     * default renderer for submenus
     *
     * @param index - The index at which to insert the item.
     *
     * @param options - The options for creating the menu item.
     *
     * @returns The menu item added to the menu.
     *
     * #### Notes
     * The index will be clamped to the bounds of the items.
     */
    insertItem(index: number, options: Menu.IItemOptions): Menu.IItem;
}
export declare namespace MenuSvg {
    function overrideDefaultRenderer(menu: Menu): void;
    /**
     * a modified implementation of the Menu Renderer
     */
    class Renderer extends Menu.Renderer {
        /**
         * Render the icon element for a menu item.
         *
         * @param data - The data to use for rendering the icon.
         *
         * @returns A virtual element representing the item icon.
         */
        renderIcon(data: Menu.IRenderData): VirtualElement;
        /**
         * Create the class name for the menu item icon.
         *
         * @param data - The data to use for the class name.
         *
         * @returns The full class name for the item icon.
         */
        createIconClass(data: Menu.IRenderData): string;
        /**
         * Render the submenu icon element for a menu item.
         *
         * @param data - The data to use for rendering the submenu icon.
         *
         * @returns A virtual element representing the submenu icon.
         */
        renderSubmenu(data: Menu.IRenderData): VirtualElement;
    }
    const defaultRenderer: Renderer;
}
