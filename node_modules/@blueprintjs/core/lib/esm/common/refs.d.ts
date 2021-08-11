export declare type IRef<T extends HTMLElement = HTMLElement> = IRefObject<T> | IRefCallback<T>;
export interface IRefObject<T extends HTMLElement = HTMLElement> {
    current: T | null;
}
export declare function isRefObject<T extends HTMLElement>(value: IRef<T> | undefined | null): value is IRefObject<T>;
export declare type IRefCallback<T extends HTMLElement = HTMLElement> = (ref: T | null) => any;
export declare function isRefCallback<T extends HTMLElement>(value: IRef<T> | undefined | null): value is IRefCallback<T>;
/**
 * Assign the given ref to a target, either a React ref object or a callback which takes the ref as its first argument.
 */
export declare function setRef<T extends HTMLElement>(refTarget: IRef<T> | undefined | null, ref: T | null): void;
/** @deprecated use mergeRefs() instead */
export declare function combineRefs<T extends HTMLElement>(ref1: IRefCallback<T>, ref2: IRefCallback<T>): IRefCallback<T>;
/**
 * Utility for merging refs into one singular callback ref.
 * If using in a functional component, would recomend using `useMemo` to preserve function identity.
 */
export declare function mergeRefs<T extends HTMLElement>(...refs: Array<IRef<T> | null>): IRefCallback<T>;
export declare function getRef<T extends HTMLElement>(ref: T | IRefObject<T> | null): T | null;
/**
 * Creates a ref handler which assigns the ref returned by React for a mounted component to a field on the target object.
 * The target object is usually a component class.
 *
 * If provided, it will also update the given `refProp` with the value of the ref.
 */
export declare function refHandler<T extends HTMLElement, K extends string>(refTargetParent: {
    [k in K]: T | null;
}, refTargetKey: K, refProp?: IRef<T> | undefined | null): IRefCallback<T>;
