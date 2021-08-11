// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { Gettext } from './gettext';
/**
 * A translator that loads a dummy language bundle that returns the same input
 * strings.
 */
class NullTranslator {
    constructor(bundle) {
        this._languageBundle = bundle;
    }
    load(domain) {
        return this._languageBundle;
    }
    locale() {
        return 'en';
    }
}
/**
 * A language bundle that returns the same input strings.
 */
class NullLanguageBundle {
    __(msgid, ...args) {
        return this.gettext(msgid, ...args);
    }
    _n(msgid, msgid_plural, n, ...args) {
        return this.ngettext(msgid, msgid_plural, n, ...args);
    }
    _p(msgctxt, msgid, ...args) {
        return this.pgettext(msgctxt, msgid, ...args);
    }
    _np(msgctxt, msgid, msgid_plural, n, ...args) {
        return this.npgettext(msgctxt, msgid, msgid_plural, n, ...args);
    }
    gettext(msgid, ...args) {
        return Gettext.strfmt(msgid, ...args);
    }
    ngettext(msgid, msgid_plural, n, ...args) {
        return Gettext.strfmt(n == 1 ? msgid : msgid_plural, ...[n].concat(args));
    }
    pgettext(msgctxt, msgid, ...args) {
        return Gettext.strfmt(msgid, ...args);
    }
    npgettext(msgctxt, msgid, msgid_plural, n, ...args) {
        return this.ngettext(msgid, msgid_plural, n, ...args);
    }
    dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, ...args) {
        return this.ngettext(msgid, msgid_plural, n, ...args);
    }
}
/**
 * The application null translator instance that just returns the same text.
 * Also provides interpolation.
 */
export const nullTranslator = new NullTranslator(new NullLanguageBundle());
//# sourceMappingURL=base.js.map