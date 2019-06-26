/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as React from "react";
import { CLAMP_MIN_MAX } from "./errors";
export * from "./utils/compareUtils";
export * from "./utils/safeInvokeMember";
/** Returns whether `process.env.NODE_ENV` exists and equals `env`. */
export function isNodeEnv(env) {
    return typeof process !== "undefined" && process.env && process.env.NODE_ENV === env;
}
/** Returns whether the value is a function. Acts as a type guard. */
// tslint:disable-next-line:ban-types
export function isFunction(value) {
    return typeof value === "function";
}
/**
 * Returns true if `node` is null/undefined, false, empty string, or an array
 * composed of those. If `node` is an array, only one level of the array is
 * checked, for performance reasons.
 */
export function isReactNodeEmpty(node, skipArray = false) {
    return (node == null ||
        node === "" ||
        node === false ||
        (!skipArray &&
            Array.isArray(node) &&
            // only recurse one level through arrays, for performance
            (node.length === 0 || node.every(n => isReactNodeEmpty(n, true)))));
}
/**
 * Converts a React node to an element: non-empty string or number or
 * `React.Fragment` (React 16.3+) is wrapped in given tag name; empty strings
 * and booleans are discarded.
 */
export function ensureElement(child, tagName = "span") {
    if (child == null || typeof child === "boolean") {
        return undefined;
    }
    else if (typeof child === "string") {
        // cull whitespace strings
        return child.trim().length > 0 ? React.createElement(tagName, {}, child) : undefined;
    }
    else if (typeof child === "number" || typeof child.type === "symbol" || Array.isArray(child)) {
        // React.Fragment has a symbol type, ReactNodeArray extends from Array
        return React.createElement(tagName, {}, child);
    }
    else if (isReactElement(child)) {
        return child;
    }
    else {
        // child is inferred as {}
        return undefined;
    }
}
export function isReactElement(child) {
    return (typeof child === "object" &&
        typeof child.type !== "undefined" &&
        typeof child.props !== "undefined");
}
export function getDisplayName(ComponentClass) {
    return ComponentClass.displayName || ComponentClass.name || "Unknown";
}
/**
 * Returns true if the given JSX element matches the given component type.
 *
 * NOTE: This function only checks equality of `displayName` for performance and
 * to tolerate multiple minor versions of a component being included in one
 * application bundle.
 * @param element JSX element in question
 * @param ComponentType desired component type of element
 */
export function isElementOfType(element, ComponentType) {
    return (element != null &&
        element.type != null &&
        element.type.displayName != null &&
        element.type.displayName === ComponentType.displayName);
}
// tslint:disable-next-line:ban-types
export function safeInvoke(func, ...args) {
    if (isFunction(func)) {
        return func(...args);
    }
    return undefined;
}
// tslint:disable-next-line:ban-types
export function safeInvokeOrValue(funcOrValue, ...args) {
    return isFunction(funcOrValue) ? funcOrValue(...args) : funcOrValue;
}
export function elementIsOrContains(element, testElement) {
    return element === testElement || element.contains(testElement);
}
/**
 * Returns the difference in length between two arrays. A `null` argument is
 * considered an empty list. The return value will be positive if `a` is longer
 * than `b`, negative if the opposite is true, and zero if their lengths are
 * equal.
 */
export function arrayLengthCompare(a = [], b = []) {
    return a.length - b.length;
}
/**
 * Returns true if the two numbers are within the given tolerance of each other.
 * This is useful to correct for floating point precision issues, less useful
 * for integers.
 */
export function approxEqual(a, b, tolerance = 0.00001) {
    return Math.abs(a - b) <= tolerance;
}
/**
 * Clamps the given number between min and max values. Returns value if within
 * range, or closest bound.
 */
export function clamp(val, min, max) {
    if (val == null) {
        return val;
    }
    if (max < min) {
        throw new Error(CLAMP_MIN_MAX);
    }
    return Math.min(Math.max(val, min), max);
}
/** Returns the number of decimal places in the given number. */
export function countDecimalPlaces(num) {
    if (!isFinite(num)) {
        return 0;
    }
    let e = 1, p = 0;
    while (Math.round(num * e) / e !== num) {
        e *= 10;
        p++;
    }
    return p;
}
/**
 * Throttle an event on an EventTarget by wrapping it in a
 * `requestAnimationFrame` call. Returns the event handler that was bound to
 * given eventName so you can clean up after yourself.
 * @see https://developer.mozilla.org/en-US/docs/Web/Events/scroll
 */
export function throttleEvent(target, eventName, newEventName) {
    const throttledFunc = _throttleHelper((event) => {
        target.dispatchEvent(new CustomEvent(newEventName, event));
    });
    target.addEventListener(eventName, throttledFunc);
    return throttledFunc;
}
/**
 * Throttle a callback by wrapping it in a `requestAnimationFrame` call. Returns
 * the throttled function.
 * @see https://www.html5rocks.com/en/tutorials/speed/animations/
 */
export function throttleReactEventCallback(callback, options = {}) {
    const throttledFunc = _throttleHelper(callback, (event2) => {
        if (options.preventDefault) {
            event2.preventDefault();
        }
    }, 
    // prevent React from reclaiming the event object before we reference it
    (event2) => event2.persist());
    return throttledFunc;
}
/**
 * Throttle a method by wrapping it in a `requestAnimationFrame` call. Returns
 * the throttled function.
 */
// tslint:disable-next-line:ban-types
export function throttle(method) {
    return _throttleHelper(method);
}
// tslint:disable-next-line:ban-types
function _throttleHelper(onAnimationFrameRequested, onBeforeIsRunningCheck, onAfterIsRunningCheck) {
    let isRunning = false;
    const func = (...args) => {
        // don't use safeInvoke, because we might have more than its max number
        // of typed params
        if (isFunction(onBeforeIsRunningCheck)) {
            onBeforeIsRunningCheck(...args);
        }
        if (isRunning) {
            return;
        }
        isRunning = true;
        if (isFunction(onAfterIsRunningCheck)) {
            onAfterIsRunningCheck(...args);
        }
        requestAnimationFrame(() => {
            onAnimationFrameRequested(...args);
            isRunning = false;
        });
    };
    return func;
}
//# sourceMappingURL=utils.js.map