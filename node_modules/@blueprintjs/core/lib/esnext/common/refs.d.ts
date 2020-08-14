export declare type IRef<T = HTMLElement> = IRefObject<T> | IRefCallback<T>;
export interface IRefObject<T = HTMLElement> {
    readonly current: T | null;
}
export declare function isRefObject<T extends HTMLElement>(value: IRef<T> | undefined | null): value is IRefObject<T>;
export declare type IRefCallback<T = HTMLElement> = (ref: T | null) => any;
export declare function isRefCallback<T extends HTMLElement>(value: IRef<T> | undefined): value is IRefCallback<T>;
export declare function getRef<T = HTMLElement>(ref: T | IRefObject<T>): T;
