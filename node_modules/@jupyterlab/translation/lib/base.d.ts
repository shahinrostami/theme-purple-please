import { ITranslator, TranslationBundle } from './tokens';
/**
 * A translator that loads a dummy language bundle that returns the same input
 * strings.
 */
declare class NullTranslator implements ITranslator {
    constructor(bundle: TranslationBundle);
    load(domain: string): TranslationBundle;
    locale(): string;
    private _languageBundle;
}
/**
 * The application null translator instance that just returns the same text.
 * Also provides interpolation.
 */
export declare const nullTranslator: NullTranslator;
export {};
