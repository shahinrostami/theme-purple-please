/**
 * Call the API extension
 *
 * @param locale API REST end point for the extension
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
export declare function requestTranslationsAPI<T>(translationsUrl?: string, locale?: string, init?: RequestInit): Promise<T>;
