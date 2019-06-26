/// <reference types="react" />
import * as React from "react";
export * from "./utils/compareUtils";
export * from "./utils/safeInvokeMember";
/** Returns whether `process.env.NODE_ENV` exists and equals `env`. */
export declare function isNodeEnv(env: string): boolean;
/** Returns whether the value is a function. Acts as a type guard. */
export declare function isFunction(value: any): value is Function;
/**
 * Returns true if `node` is null/undefined, false, empty string, or an array
 * composed of those. If `node` is an array, only one level of the array is
 * checked, for performance reasons.
 */
export declare function isReactNodeEmpty(node?: React.ReactNode, skipArray?: boolean): boolean;
/**
 * Converts a React node to an element: non-empty string or number or
 * `React.Fragment` (React 16.3+) is wrapped in given tag name; empty strings
 * and booleans are discarded.
 */
export declare function ensureElement(child: React.ReactNode | undefined, tagName?: keyof JSX.IntrinsicElements): React.ReactElement<any>;
export declare function isReactElement<T = any>(child: React.ReactNode): child is React.ReactElement<T>;
/**
 * Represents anything that has a `name` property such as Functions.
 */
export interface INamed {
    name?: string;
}
export declare function getDisplayName(ComponentClass: React.ComponentType | INamed): string;
/**
 * Returns true if the given JSX element matches the given component type.
 *
 * NOTE: This function only checks equality of `displayName` for performance and
 * to tolerate multiple minor versions of a component being included in one
 * application bundle.
 * @param element JSX element in question
 * @param ComponentType desired component type of element
 */
export declare function isElementOfType<P = {}>(element: any, ComponentType: React.ComponentType<P>): element is React.ReactElement<P>;
/**
 * Safely invoke the function with the given arguments, if it is indeed a
 * function, and return its value. Otherwise, return undefined.
 */
export declare function safeInvoke<R>(func: (() => R) | undefined): R | undefined;
export declare function safeInvoke<A, R>(func: ((arg1: A) => R) | undefined, arg1: A): R | undefined;
export declare function safeInvoke<A, B, R>(func: ((arg1: A, arg2: B) => R) | undefined, arg1: A, arg2: B): R | undefined;
export declare function safeInvoke<A, B, C, R>(func: ((arg1: A, arg2: B, arg3: C) => R) | undefined, arg1: A, arg2: B, arg3: C): R | undefined;
export declare function safeInvoke<A, B, C, D, R>(func: ((arg1: A, arg2: B, arg3: C, arg4: D) => R) | undefined, arg1: A, arg2: B, arg3: C, arg4: D): R | undefined;
/**
 * Safely invoke the provided entity if it is a function; otherwise, return the
 * entity itself.
 */
export declare function safeInvokeOrValue<R>(funcOrValue: (() => R) | R | undefined): R;
export declare function safeInvokeOrValue<A, R>(funcOrValue: ((arg1: A) => R) | R | undefined, arg1: A): R;
export declare function safeInvokeOrValue<A, B, R>(funcOrValue: ((arg1: A, arg2: B) => R) | R | undefined, arg1: A, arg2: B): R;
export declare function safeInvokeOrValue<A, B, C, R>(funcOrValue: ((arg1: A, arg2: B, arg3: C) => R) | R | undefined, arg1: A, arg2: B, arg3: C): R;
export declare function safeInvokeOrValue<A, B, C, D, R>(funcOrValue: ((arg1: A, arg2: B, arg3: C, arg4: D) => R) | R | undefined, arg1: A, arg2: B, arg3: C, arg4: D): R;
export declare function elementIsOrContains(element: HTMLElement, testElement: HTMLElement): boolean;
/**
 * Returns the difference in length between two arrays. A `null` argument is
 * considered an empty list. The return value will be positive if `a` is longer
 * than `b`, negative if the opposite is true, and zero if their lengths are
 * equal.
 */
export declare function arrayLengthCompare(a?: any[], b?: any[]): number;
/**
 * Returns true if the two numbers are within the given tolerance of each other.
 * This is useful to correct for floating point precision issues, less useful
 * for integers.
 */
export declare function approxEqual(a: number, b: number, tolerance?: number): boolean;
/**
 * Clamps the given number between min and max values. Returns value if within
 * range, or closest bound.
 */
export declare function clamp(val: number, min: number, max: number): number;
/** Returns the number of decimal places in the given number. */
export declare function countDecimalPlaces(num: number): number;
/**
 * Throttle an event on an EventTarget by wrapping it in a
 * `requestAnimationFrame` call. Returns the event handler that was bound to
 * given eventName so you can clean up after yourself.
 * @see https://developer.mozilla.org/en-US/docs/Web/Events/scroll
 */
export declare function throttleEvent(target: EventTarget, eventName: string, newEventName: string): (event: Event) => void;
export interface IThrottledReactEventOptions {
    preventDefault?: boolean;
}
/**
 * Throttle a callback by wrapping it in a `requestAnimationFrame` call. Returns
 * the throttled function.
 * @see https://www.html5rocks.com/en/tutorials/speed/animations/
 */
export declare function throttleReactEventCallback(callback: (event: React.SyntheticEvent<any>, ...otherArgs: any[]) => any, options?: IThrottledReactEventOptions): (event2: React.SyntheticEvent<any>) => void;
/**
 * Throttle a method by wrapping it in a `requestAnimationFrame` call. Returns
 * the throttled function.
 */
export declare function throttle<T extends Function>(method: T): T;
