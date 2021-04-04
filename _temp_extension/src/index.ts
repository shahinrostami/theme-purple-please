import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the @shahinrostami/theme-purple-please extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: '@shahinrostami/theme-purple-please:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension @shahinrostami/theme-purple-please is activated!');
  }
};

export default extension;
