import * as types from './../types';
export declare type Dictionary = {
    [key: string]: any;
};
/**
 * We need to do the following to *our* objects before passing to freestyle:
 * - For any `$nest` directive move up to FreeStyle style nesting
 * - For any `$unique` directive map to FreeStyle Unique
 * - For any `$debugName` directive return the debug name
 */
export declare function ensureStringObj(object: types.NestedCSSProperties): {
    result: any;
    debugName: string;
};
export declare function explodeKeyframes(frames: types.KeyFrames): {
    $debugName?: string;
    keyframes: types.KeyFrames;
};
