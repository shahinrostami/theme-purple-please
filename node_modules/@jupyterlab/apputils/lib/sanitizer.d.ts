import { ISanitizer } from './tokens';
/**
 * A class to sanitize HTML strings.
 */
export declare class Sanitizer implements ISanitizer {
    /**
     * Sanitize an HTML string.
     *
     * @param dirty - The dirty text.
     *
     * @param options - The optional sanitization options.
     *
     * @returns The sanitized string.
     */
    sanitize(dirty: string, options?: ISanitizer.IOptions): string;
    private _options;
}
/**
 * The default instance of an `ISanitizer` meant for use by user code.
 */
export declare const defaultSanitizer: ISanitizer;
