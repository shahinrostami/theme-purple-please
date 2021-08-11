import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ContextMenu, Menu } from '@lumino/widgets';
/**
 * Helper functions to build a menu from the settings
 */
export declare namespace MenuFactory {
    /**
     * Menu constructor options
     */
    interface IMenuOptions {
        /**
         * The unique menu identifier.
         */
        id: string;
        /**
         * The menu label.
         */
        label?: string;
        /**
         * The menu rank.
         */
        rank?: number;
    }
    /**
     * Create menus from their description
     *
     * @param data Menubar description
     * @param menuFactory Factory for empty menu
     */
    function createMenus(data: ISettingRegistry.IMenu[], menuFactory: (options: IMenuOptions) => Menu): Menu[];
    /**
     * Convert an item description in a context menu item object
     *
     * @param item Context menu item
     * @param menu Context menu to populate
     * @param menuFactory Empty menu factory
     */
    function addContextItem(item: ISettingRegistry.IContextMenuItem, menu: ContextMenu, menuFactory: (options: IMenuOptions) => Menu): void;
    /**
     * Update an existing list of menu and returns
     * the new elements.
     *
     * #### Note
     * New elements are added to the current menu list.
     *
     * @param menus Current menus
     * @param data New description to take into account
     * @param menuFactory Empty menu factory
     * @returns Newly created menus
     */
    function updateMenus(menus: Menu[], data: ISettingRegistry.IMenu[], menuFactory: (options: IMenuOptions) => Menu): Menu[];
}
