/**
 * The namespace for Page Config functions.
 */
export declare namespace PageConfig {
    /**
     * The tree URL construction options.
     */
    interface ITreeOptions {
        /**
         * If `true`, the tree URL will include the current workspace, if any.
         */
        workspace?: boolean;
    }
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
    function getOption(name: string): string;
    /**
     * Set global configuration data for the Jupyter application.
     *
     * @param name - The name of the configuration option.
     * @param value - The value to set the option to.
     *
     * @returns The last config value or an empty string if it doesn't exist.
     */
    function setOption(name: string, value: string): string;
    /**
     * Get the base url for a Jupyter application, or the base url of the page.
     */
    function getBaseUrl(): string;
    /**
     * Get the tree url for a JupyterLab application.
     *
     * @param options - The tree URL construction options.
     */
    function getTreeUrl(options?: ITreeOptions): string;
    /**
     * Get the base websocket url for a Jupyter application, or an empty string.
     */
    function getWsUrl(baseUrl?: string): string;
    /**
     * Get the authorization token for a Jupyter application.
     */
    function getToken(): string;
    /**
     * Get the Notebook version info [major, minor, patch].
     */
    function getNotebookVersion(): [number, number, number];
}
