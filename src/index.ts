import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  IThemeManager
} from '@jupyterlab/apputils';

/**
 * A plugin for @shahinrostami/theme-purple-please
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@shahinrostami/theme-purple-please:plugin',
  requires: [IThemeManager],
  activate: function(app: JupyterFrontEnd, manager: IThemeManager) {
    manager.register({
      name: 'theme-purple-please',
      isLight: true,
      load: function() {
        return manager.loadCSS('@shahinrostami/theme-purple-please/index.css');
      },
      unload: function() {
        return Promise.resolve(void 0);
      }
    });
  },
  autoStart: true
};

export default plugin;
