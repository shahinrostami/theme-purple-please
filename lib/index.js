"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
/**
 * A plugin for @shahinrostami/theme-purple-please
 */
const plugin = {
    id: '@shahinrostami/theme-purple-please:plugin',
    requires: [apputils_1.IThemeManager],
    activate: (app, manager) => {
        const style = '@shahinrostami/theme-purple-please/index.css';
        manager.register({
            name: 'theme-purple-please',
            isLight: false,
            themeScrollbars: true,
            load: () => manager.loadCSS(style),
            unload: () => Promise.resolve(undefined)
        });
    },
    autoStart: true
};
exports.default = plugin;
