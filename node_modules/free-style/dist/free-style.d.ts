/**
 * Valid CSS property values.
 */
export declare type PropertyValue = number | boolean | string;
/**
 * Input styles object.
 */
export interface Styles {
    [selector: string]: null | undefined | PropertyValue | PropertyValue[] | Styles;
}
/**
 * Hash algorithm interface.
 */
export declare type HashFunction = (str: string) => string;
/**
 * Tag styles with this string to get unique hashes.
 */
export declare const IS_UNIQUE = "__DO_NOT_DEDUPE_STYLE__";
/**
 * Escape a CSS class name.
 */
export declare const escape: (str: string) => string;
/**
 * Transform a JavaScript property into a CSS property.
 */
export declare function hyphenate(propertyName: string): string;
/**
 * Generate a hash value from a string.
 */
export declare function stringHash(str: string): string;
/**
 * Propagate change events.
 */
export interface Changes {
    add(style: Container<any>, index: number): void;
    change(style: Container<any>, oldIndex: number, newIndex: number): void;
    remove(style: Container<any>, index: number): void;
}
/**
 * Cacheable interface.
 */
export interface Container<T> {
    id: string;
    clone(): T;
    getStyles(): string;
}
/**
 * Implement a cache/event emitter.
 */
export declare class Cache<T extends Container<any>> {
    changes: Changes;
    sheet: string[];
    changeId: number;
    private _keys;
    private _children;
    private _counters;
    constructor(changes?: Changes);
    add<U extends T>(style: U): U;
    remove(style: T): void;
    values(): T[];
    merge(cache: Cache<any>): this;
    unmerge(cache: Cache<any>): this;
    clone(): Cache<T>;
}
/**
 * Selector is a dumb class made to represent nested CSS selectors.
 */
export declare class Selector implements Container<Selector> {
    selector: string;
    id: string;
    constructor(selector: string, id: string);
    getStyles(): string;
    clone(): Selector;
}
/**
 * The style container registers a style string with selectors.
 */
export declare class Style extends Cache<Selector> implements Container<Style> {
    style: string;
    id: string;
    constructor(style: string, id: string);
    getStyles(): string;
    clone(): Style;
}
/**
 * Implement rule logic for style output.
 */
export declare class Rule extends Cache<Rule | Style> implements Container<Rule> {
    rule: string;
    style: string;
    id: string;
    constructor(rule: string, style: string, id: string);
    getStyles(): string;
    clone(): Rule;
}
/**
 * The FreeStyle class implements the API for everything else.
 */
export declare class FreeStyle extends Cache<Rule | Style> implements Container<FreeStyle> {
    hash: HashFunction;
    debug: boolean;
    id: string;
    constructor(hash: HashFunction, debug: boolean, id: string, changes?: Changes);
    registerStyle(styles: Styles, displayName?: string): string;
    registerKeyframes(keyframes: Styles, displayName?: string): string;
    registerHashRule(prefix: string, styles: Styles, displayName?: string): string;
    registerRule(rule: string, styles: Styles): void;
    registerCss(styles: Styles): void;
    getStyles(): string;
    clone(): FreeStyle;
}
/**
 * Exports a simple function to create a new instance.
 */
export declare function create(hash?: HashFunction, debug?: boolean, changes?: Changes): FreeStyle;
