import { DataConnector, IDataConnector } from '@jupyterlab/statedb';
import { Token } from '@lumino/coreutils';
declare type Language = {
    [key: string]: string;
};
export interface ITranslatorConnector extends IDataConnector<Language, Language, {
    language: string;
}> {
}
export declare const ITranslatorConnector: Token<ITranslatorConnector>;
export declare class TranslatorConnector extends DataConnector<Language, Language, {
    language: string;
}> implements ITranslatorConnector {
    constructor(translationsUrl?: string);
    fetch(opts: {
        language: string;
    }): Promise<Language>;
    private _translationsUrl;
}
export declare type TranslationBundle = {
    __(msgid: string, ...args: any[]): string;
    _n(msgid: string, msgid_plural: string, n: number, ...args: any[]): string;
    _p(msgctxt: string, msgid: string, ...args: any[]): string;
    _np(msgctxt: string, msgid: string, msgid_plural: string, n: number, ...args: any[]): string;
    gettext(msgid: string, ...args: any[]): string;
    ngettext(msgid: string, msgid_plural: string, n: number, ...args: any[]): string;
    pgettext(msgctxt: string, msgid: string, ...args: any[]): string;
    npgettext(msgctxt: string, msgid: string, msgid_plural: string, n: number, ...args: any[]): string;
    dcnpgettext(domain: string, msgctxt: string, msgid: string, msgid_plural: string, n: number, ...args: any[]): string;
};
export interface ITranslator {
    load(domain: string): TranslationBundle;
}
export declare const ITranslator: Token<ITranslator>;
export {};
