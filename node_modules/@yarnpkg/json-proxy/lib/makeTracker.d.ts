export declare type TrackingVersion = Object;
export declare type TrackingFilter = true | TrackingFilterObject;
interface TrackingFilterObject {
    [key: string]: TrackingFilter;
}
export declare type Tracker<T> = (cb: (value: T) => void) => T;
export declare function makeTracker<T>(value: T, filter?: TrackingFilter): {
    immutable: T;
    open(cb: (value: T) => void): T;
};
export {};
