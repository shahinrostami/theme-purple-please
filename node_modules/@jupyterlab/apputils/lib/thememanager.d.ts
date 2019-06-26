import { IChangedArgs, ISettingRegistry } from '@jupyterlab/coreutils';
import { Token } from '@phosphor/coreutils';
import { IDisposable } from '@phosphor/disposable';
import { Widget } from '@phosphor/widgets';
import { ISignal } from '@phosphor/signaling';
import { ISplashScreen } from './splash';
/**
 * The theme manager token.
 */
export declare const IThemeManager: Token<IThemeManager>;
/**
 * An interface for a theme manager.
 */
export interface IThemeManager extends ThemeManager {
}
/**
 * A class that provides theme management.
 */
export declare class ThemeManager {
    /**
     * Construct a new theme manager.
     */
    constructor(options: ThemeManager.IOptions);
    /**
     * Get the name of the current theme.
     */
    readonly theme: string | null;
    /**
     * The names of the registered themes.
     */
    readonly themes: ReadonlyArray<string>;
    /**
     * A signal fired when the application theme changes.
     */
    readonly themeChanged: ISignal<this, IChangedArgs<string>>;
    /**
     * Load a theme CSS file by path.
     *
     * @param path - The path of the file to load.
     */
    loadCSS(path: string): Promise<void>;
    /**
     * Register a theme with the theme manager.
     *
     * @param theme - The theme to register.
     *
     * @returns A disposable that can be used to unregister the theme.
     */
    register(theme: ThemeManager.ITheme): IDisposable;
    /**
     * Set the current theme.
     */
    setTheme(name: string): Promise<void>;
    /**
     * Test whether a given theme is light.
     */
    isLight(name: string): boolean;
    /**
     * Handle the current settings.
     */
    private _loadSettings;
    /**
     * Load the theme.
     *
     * #### Notes
     * This method assumes that the `theme` exists.
     */
    private _loadTheme;
    /**
     * Handle a theme error.
     */
    private _onError;
    private _base;
    private _current;
    private _host;
    private _links;
    private _outstanding;
    private _pending;
    private _requests;
    private _settings;
    private _splash;
    private _themes;
    private _themeChanged;
}
/**
 * A namespace for `ThemeManager` statics.
 */
export declare namespace ThemeManager {
    /**
     * The options used to create a theme manager.
     */
    interface IOptions {
        /**
         * The host widget for the theme manager.
         */
        host: Widget;
        /**
         * The setting registry key that holds theme setting data.
         */
        key: string;
        /**
         * The settings registry.
         */
        settings: ISettingRegistry;
        /**
         * The splash screen to show when loading themes.
         */
        splash: ISplashScreen;
        /**
         * The url for local theme loading.
         */
        url: string;
    }
    /**
     * An interface for a theme.
     */
    interface ITheme {
        /**
         * The display name of the theme.
         */
        name: string;
        /**
         * Whether the theme is light or dark. Downstream authors
         * of extensions can use this information to customize their
         * UI depending upon the current theme.
         */
        isLight: boolean;
        /**
         * Load the theme.
         *
         * @returns A promise that resolves when the theme has loaded.
         */
        load(): Promise<void>;
        /**
         * Unload the theme.
         *
         * @returns A promise that resolves when the theme has unloaded.
         */
        unload(): Promise<void>;
    }
}
