// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { showErrorMessage } from '@jupyterlab/apputils';
import { nullTranslator } from '@jupyterlab/translation';
/**
 * A default connection lost handler, which brings up an error dialog.
 */
export const ConnectionLost = async function (manager, err, translator) {
    translator = translator || nullTranslator;
    const trans = translator.load('jupyterlab');
    const title = trans.__('Server Connection Error');
    const networkMsg = trans.__('A connection to the Jupyter server could not be established.\n' +
        'JupyterLab will continue trying to reconnect.\n' +
        'Check your network connection or Jupyter server configuration.\n');
    return showErrorMessage(title, { message: networkMsg });
};
//# sourceMappingURL=connectionlost.js.map