/** This file contains types duplicated from resize-observer-polyfill which are not exported in a consumer-friendly way. */
export declare type ResizeEntry = IResizeEntry;
/**
 * Equivalent to `ResizeObserverEntry`
 *
 * @deprecated use ResizeEntry
 */
export interface IResizeEntry {
    /** Measured dimensions of the target. */
    readonly contentRect: DOMRectReadOnly;
    /** The resized element. */
    readonly target: Element;
}
export declare type DOMRectReadOnly = IDOMRectReadOnly;
/** @deprecated use DOMRectReadOnly */
interface IDOMRectReadOnly {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
}
export {};
