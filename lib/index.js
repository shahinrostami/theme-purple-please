"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
/**
 * A plugin for @shahinrostami/theme-purple-please
 */
const plugin = {
    id: '@shahinrostami/theme-purple-please:plugin',
    requires: [apputils_1.IThemeManager],
    activate: function (app, manager) {
        manager.register({
            name: 'theme-purple-please',
            isLight: true,
            load: function () {
                return manager.loadCSS('@shahinrostami/theme-purple-please/index.css');
            },
            unload: function () {
                return Promise.resolve(void 0);
            }
        });
    },
    autoStart: true
};
exports.default = plugin;
