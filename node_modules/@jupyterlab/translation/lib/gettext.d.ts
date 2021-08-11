/**
 * A plural form function.
 */
declare type PluralForm = (n: number) => number;
/**
 * Metadata for a language pack.
 */
interface IJsonDataHeader {
    /**
     * Language locale. Example: es_CO, es-CO.
     */
    language: string;
    /**
     * The domain of the translation, usually the normalized package name.
     * Example: "jupyterlab", "jupyterlab_git"
     *
     * #### Note
     * Normalization replaces `-` by `_` in package name.
     */
    domain: string;
    /**
     * String describing the plural of the given language.
     * See: https://www.gnu.org/software/gettext/manual/html_node/Translating-plural-forms.html
     */
    pluralForms: string;
}
/**
 * Translatable string messages.
 */
interface IJsonDataMessages {
    /**
     * Translation strings for a given msg_id.
     */
    [key: string]: string[] | IJsonDataHeader;
}
/**
 * Translatable string messages incluing metadata.
 */
interface IJsonData extends IJsonDataMessages {
    /**
     * Metadata of the language bundle.
     */
    '': IJsonDataHeader;
}
/**
 * Configurable options for the Gettext constructor.
 */
interface IOptions {
    /**
     * Language locale. Example: es_CO, es-CO.
     */
    locale?: string;
    /**
     * The domain of the translation, usually the normalized package name.
     * Example: "jupyterlab", "jupyterlab_git"
     *
     * #### Note
     * Normalization replaces `-` by `_` in package name.
     */
    domain?: string;
    /**
     * The delimiter to use when adding contextualized strings.
     */
    contextDelimiter?: string;
    /**
     * Translation message strings.
     */
    messages?: Array<string>;
    /**
     * String describing the plural of the given language.
     * See: https://www.gnu.org/software/gettext/manual/html_node/Translating-plural-forms.html
     */
    pluralForms?: string;
    /**
     * The string prefix to add to localized strings.
     */
    stringsPrefix?: string;
    /**
     * Plural form function.
     */
    pluralFunc?: PluralForm;
}
/**
 * Gettext class providing localization methods.
 */
declare class Gettext {
    constructor(options?: IOptions);
    /**
     * Set current context delimiter.
     *
     * @param delimiter - The delimiter to set.
     */
    setContextDelimiter(delimiter: string): void;
    /**
     * Get current context delimiter.
     *
     * @return The current delimiter.
     */
    getContextDelimiter(): string;
    /**
     * Set current locale.
     *
     * @param locale - The locale to set.
     */
    setLocale(locale: string): void;
    /**
     * Get current locale.
     *
     * @return The current locale.
     */
    getLocale(): string;
    /**
     * Set current domain.
     *
     * @param domain - The domain to set.
     */
    setDomain(domain: string): void;
    /**
     * Get current domain.
     *
     * @return The current domain string.
     */
    getDomain(): string;
    /**
     * Set current strings prefix.
     *
     * @param prefix - The string prefix to set.
     */
    setStringsPrefix(prefix: string): void;
    /**
     * Get current strings prefix.
     *
     * @return The strings prefix.
     */
    getStringsPrefix(): string;
    /**
     * `sprintf` equivalent, takes a string and some arguments to make a
     * computed string.
     *
     * @param fmt - The string to interpolate.
     * @param args - The variables to use in interpolation.
     *
     * ### Examples
     * strfmt("%1 dogs are in %2", 7, "the kitchen"); => "7 dogs are in the kitchen"
     * strfmt("I like %1, bananas and %1", "apples"); => "I like apples, bananas and apples"
     */
    static strfmt(fmt: string, ...args: any[]): string;
    /**
     * Load json translations strings (In Jed 2.x format).
     *
     * @param jsonData - The translation strings plus metadata.
     * @param domain - The translation domain, e.g. "jupyterlab".
     */
    loadJSON(jsonData: IJsonData, domain: string): void;
    /**
     * Shorthand for gettext.
     *
     * @param msgid - The singular string to translate.
     * @param args - Any additional values to use with interpolation.
     *
     * @return A translated string if found, or the original string.
     *
     * ### Notes
     * This is not a private method (starts with an underscore) it is just
     * a shorter and standard way to call these methods.
     */
    __(msgid: string, ...args: any[]): string;
    /**
     * Shorthand for ngettext.
     *
     * @param msgid - The singular string to translate.
     * @param msgid_plural - The plural string to translate.
     * @param n - The number for pluralization.
     * @param args - Any additional values to use with interpolation.
     *
     * @return A translated string if found, or the original string.
     *
     * ### Notes
     * This is not a private method (starts with an underscore) it is just
     * a shorter and standard way to call these methods.
     */
    _n(msgid: string, msgid_plural: string, n: number, ...args: any[]): string;
    /**
     * Shorthand for pgettext.
     *
     * @param msgctxt - The message context.
     * @param msgid - The singular string to translate.
     * @param args - Any additional values to use with interpolation.
     *
     * @return A translated string if found, or the original string.
     *
     * ### Notes
     * This is not a private method (starts with an underscore) it is just
     * a shorter and standard way to call these methods.
     */
    _p(msgctxt: string, msgid: string, ...args: any[]): string;
    /**
     * Shorthand for npgettext.
     *
     * @param msgctxt - The message context.
     * @param msgid - The singular string to translate.
     * @param msgid_plural - The plural string to translate.
     * @param n - The number for pluralization.
     * @param args - Any additional values to use with interpolation.
     *
     * @return A translated string if found, or the original string.
     *
     * ### Notes
     * This is not a private method (starts with an underscore) it is just
     * a shorter and standard way to call these methods.
     */
    _np(msgctxt: string, msgid: string, msgid_plural: string, n: number, ...args: any[]): string;
    /**
     * Translate a singular string with extra interpolation values.
     *
     * @param msgid - The singular string to translate.
     * @param args - Any additional values to use with interpolation.
     *
     * @return A translated string if found, or the original string.
     */
    gettext(msgid: string, ...args: any[]): string;
    /**
     * Translate a plural string with extra interpolation values.
     *
     * @param msgid - The singular string to translate.
     * @param args - Any additional values to use with interpolation.
     *
     * @return A translated string if found, or the original string.
     */
    ngettext(msgid: string, msgid_plural: string, n: number, ...args: any[]): string;
    /**
     * Translate a contextualized singular string with extra interpolation values.
     *
     * @param msgctxt - The message context.
     * @param msgid - The singular string to translate.
     * @param args - Any additional values to use with interpolation.
     *
     * @return A translated string if found, or the original string.
     *
     * ### Notes
     * This is not a private method (starts with an underscore) it is just
     * a shorter and standard way to call these methods.
     */
    pgettext(msgctxt: string, msgid: string, ...args: any[]): string;
    /**
     * Translate a contextualized plural string with extra interpolation values.
     *
     * @param msgctxt - The message context.
     * @param msgid - The singular string to translate.
     * @param msgid_plural - The plural string to translate.
     * @param n - The number for pluralization.
     * @param args - Any additional values to use with interpolation
     *
     * @return A translated string if found, or the original string.
     */
    npgettext(msgctxt: string, msgid: string, msgid_plural: string, n: number, ...args: any[]): string;
    /**
     * Translate a singular string with extra interpolation values.
     *
     * @param domain - The translations domain.
     * @param msgctxt - The message context.
     * @param msgid - The singular string to translate.
     * @param msgid_plural - The plural string to translate.
     * @param n - The number for pluralization.
     * @param args - Any additional values to use with interpolation
     *
     * @return A translated string if found, or the original string.
     */
    dcnpgettext(domain: string, msgctxt: string, msgid: string, msgid_plural: string, n: number, ...args: any[]): string;
    /**
     * Split a locale into parent locales. "es-CO" -> ["es-CO", "es"]
     *
     * @param locale - The locale string.
     *
     * @return An array of locales.
     */
    private expandLocale;
    /**
     * Split a locale into parent locales. "es-CO" -> ["es-CO", "es"]
     *
     * @param pluralForm - Plural form string..
     * @return An function to compute plural forms.
     */
    private getPluralFunc;
    /**
     * Remove the context delimiter from string.
     *
     * @param str - Translation string.
     * @return A translation string without context.
     */
    private removeContext;
    /**
     * Proper translation function that handle plurals and directives.
     *
     * @param messages - List of translation strings.
     * @param n - The number for pluralization.
     * @param options - Translation options.
     * @param args - Any variables to interpolate.
     *
     * @return A translation string without context.
     *
     * ### Notes
     * Contains juicy parts of https://github.com/Orange-OpenSource/gettext.js/blob/master/lib.gettext.js
     */
    private t;
    /**
     * Set messages after loading them.
     *
     * @param domain - The translation domain.
     * @param locale - The translation locale.
     * @param messages - List of translation strings.
     * @param pluralForms - Plural form string.
     *
     * ### Notes
     * Contains juicy parts of https://github.com/Orange-OpenSource/gettext.js/blob/master/lib.gettext.js
     */
    private setMessages;
    private _stringsPrefix;
    private _pluralForms;
    private _dictionary;
    private _locale;
    private _domain;
    private _contextDelimiter;
    private _pluralFuncs;
    private _defaults;
}
export { Gettext };
