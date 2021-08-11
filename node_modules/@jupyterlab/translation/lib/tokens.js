/* ----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
import { DataConnector } from '@jupyterlab/statedb';
import { Token } from '@lumino/coreutils';
import { requestTranslationsAPI } from './server';
export const ITranslatorConnector = new Token('@jupyterlab/translation:ITranslatorConnector');
export class TranslatorConnector extends DataConnector {
    constructor(translationsUrl = '') {
        super();
        this._translationsUrl = translationsUrl;
    }
    async fetch(opts) {
        return requestTranslationsAPI(this._translationsUrl, opts.language);
    }
}
export const ITranslator = new Token('@jupyterlab/translation:ITranslator');
//# sourceMappingURL=tokens.js.map