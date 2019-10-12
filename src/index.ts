import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IThemeManager } from '@jupyterlab/apputils';

/**
 * A plugin for @shahinrostami/theme-purple-please
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@shahinrostami/theme-purple-please:plugin',
  requires: [IThemeManager],
  activate: function(app: JupyterFrontEnd, manager: IThemeManager) {
    const style = '@shahinrostami/theme-purple-please/index.css';

    manager.register({
      name: 'theme-purple-please',
      isLight: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  },
  autoStart: true
};

export default plugin;
