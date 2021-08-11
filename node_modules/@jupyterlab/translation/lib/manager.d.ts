import { ITranslator, TranslationBundle } from './tokens';
/**
 * Translation Manager
 */
export declare class TranslationManager implements ITranslator {
    constructor(translationsUrl?: string, stringsPrefix?: string);
    /**
     * Fetch the localization data from the server.
     *
     * @param locale The language locale to use for translations.
     */
    fetch(locale: string): Promise<void>;
    /**
     * Load translation bundles for a given domain.
     *
     * @param domain The translation domain to use for translations.
     */
    load(domain: string): TranslationBundle;
    private _connector;
    private _currentLocale;
    private _domainData;
    private _englishBundle;
    private _languageData;
    private _stringsPrefix;
    private _translationBundles;
}
