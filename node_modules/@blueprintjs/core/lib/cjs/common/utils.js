"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var errors_1 = require("./errors");
tslib_1.__exportStar(require("./utils/compareUtils"), exports);
tslib_1.__exportStar(require("./utils/safeInvokeMember"), exports);
/** Returns whether `process.env.NODE_ENV` exists and equals `env`. */
function isNodeEnv(env) {
    return typeof process !== "undefined" && process.env && process.env.NODE_ENV === env;
}
exports.isNodeEnv = isNodeEnv;
/** Returns whether the value is a function. Acts as a type guard. */
// tslint:disable-next-line:ban-types
function isFunction(value) {
    return typeof value === "function";
}
exports.isFunction = isFunction;
/**
 * Returns true if `node` is null/undefined, false, empty string, or an array
 * composed of those. If `node` is an array, only one level of the array is
 * checked, for performance reasons.
 */
function isReactNodeEmpty(node, skipArray) {
    if (skipArray === void 0) { skipArray = false; }
    return (node == null ||
        node === "" ||
        node === false ||
        (!skipArray &&
            Array.isArray(node) &&
            // only recurse one level through arrays, for performance
            (node.length === 0 || node.every(function (n) { return isReactNodeEmpty(n, true); }))));
}
exports.isReactNodeEmpty = isReactNodeEmpty;
/**
 * Converts a React node to an element: non-empty string or number or
 * `React.Fragment` (React 16.3+) is wrapped in given tag name; empty strings
 * and booleans are discarded.
 */
function ensureElement(child, tagName) {
    if (tagName === void 0) { tagName = "span"; }
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
exports.ensureElement = ensureElement;
function isReactElement(child) {
    return (typeof child === "object" &&
        typeof child.type !== "undefined" &&
        typeof child.props !== "undefined");
}
exports.isReactElement = isReactElement;
function getDisplayName(ComponentClass) {
    return ComponentClass.displayName || ComponentClass.name || "Unknown";
}
exports.getDisplayName = getDisplayName;
/**
 * Returns true if the given JSX element matches the given component type.
 *
 * NOTE: This function only checks equality of `displayName` for performance and
 * to tolerate multiple minor versions of a component being included in one
 * application bundle.
 * @param element JSX element in question
 * @param ComponentType desired component type of element
 */
function isElementOfType(element, ComponentType) {
    return (element != null &&
        element.type != null &&
        element.type.displayName != null &&
        element.type.displayName === ComponentType.displayName);
}
exports.isElementOfType = isElementOfType;
// tslint:disable-next-line:ban-types
function safeInvoke(func) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (isFunction(func)) {
        return func.apply(void 0, args);
    }
    return undefined;
}
exports.safeInvoke = safeInvoke;
// tslint:disable-next-line:ban-types
function safeInvokeOrValue(funcOrValue) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return isFunction(funcOrValue) ? funcOrValue.apply(void 0, args) : funcOrValue;
}
exports.safeInvokeOrValue = safeInvokeOrValue;
function elementIsOrContains(element, testElement) {
    return element === testElement || element.contains(testElement);
}
exports.elementIsOrContains = elementIsOrContains;
/**
 * Returns the difference in length between two arrays. A `null` argument is
 * considered an empty list. The return value will be positive if `a` is longer
 * than `b`, negative if the opposite is true, and zero if their lengths are
 * equal.
 */
function arrayLengthCompare(a, b) {
    if (a === void 0) { a = []; }
    if (b === void 0) { b = []; }
    return a.length - b.length;
}
exports.arrayLengthCompare = arrayLengthCompare;
/**
 * Returns true if the two numbers are within the given tolerance of each other.
 * This is useful to correct for floating point precision issues, less useful
 * for integers.
 */
function approxEqual(a, b, tolerance) {
    if (tolerance === void 0) { tolerance = 0.00001; }
    return Math.abs(a - b) <= tolerance;
}
exports.approxEqual = approxEqual;
/**
 * Clamps the given number between min and max values. Returns value if within
 * range, or closest bound.
 */
function clamp(val, min, max) {
    if (val == null) {
        return val;
    }
    if (max < min) {
        throw new Error(errors_1.CLAMP_MIN_MAX);
    }
    return Math.min(Math.max(val, min), max);
}
exports.clamp = clamp;
/** Returns the number of decimal places in the given number. */
function countDecimalPlaces(num) {
    if (!isFinite(num)) {
        return 0;
    }
    var e = 1, p = 0;
    while (Math.round(num * e) / e !== num) {
        e *= 10;
        p++;
    }
    return p;
}
exports.countDecimalPlaces = countDecimalPlaces;
/**
 * Throttle an event on an EventTarget by wrapping it in a
 * `requestAnimationFrame` call. Returns the event handler that was bound to
 * given eventName so you can clean up after yourself.
 * @see https://developer.mozilla.org/en-US/docs/Web/Events/scroll
 */
function throttleEvent(target, eventName, newEventName) {
    var throttledFunc = _throttleHelper(function (event) {
        target.dispatchEvent(new CustomEvent(newEventName, event));
    });
    target.addEventListener(eventName, throttledFunc);
    return throttledFunc;
}
exports.throttleEvent = throttleEvent;
/**
 * Throttle a callback by wrapping it in a `requestAnimationFrame` call. Returns
 * the throttled function.
 * @see https://www.html5rocks.com/en/tutorials/speed/animations/
 */
function throttleReactEventCallback(callback, options) {
    if (options === void 0) { options = {}; }
    var throttledFunc = _throttleHelper(callback, function (event2) {
        if (options.preventDefault) {
            event2.preventDefault();
        }
    }, 
    // prevent React from reclaiming the event object before we reference it
    function (event2) { return event2.persist(); });
    return throttledFunc;
}
exports.throttleReactEventCallback = throttleReactEventCallback;
/**
 * Throttle a method by wrapping it in a `requestAnimationFrame` call. Returns
 * the throttled function.
 */
// tslint:disable-next-line:ban-types
function throttle(method) {
    return _throttleHelper(method);
}
exports.throttle = throttle;
// tslint:disable-next-line:ban-types
function _throttleHelper(onAnimationFrameRequested, onBeforeIsRunningCheck, onAfterIsRunningCheck) {
    var isRunning = false;
    var func = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // don't use safeInvoke, because we might have more than its max number
        // of typed params
        if (isFunction(onBeforeIsRunningCheck)) {
            onBeforeIsRunningCheck.apply(void 0, args);
        }
        if (isRunning) {
            return;
        }
        isRunning = true;
        if (isFunction(onAfterIsRunningCheck)) {
            onAfterIsRunningCheck.apply(void 0, args);
        }
        requestAnimationFrame(function () {
            onAnimationFrameRequested.apply(void 0, args);
            isRunning = false;
        });
    };
    return func;
}
//# sourceMappingURL=utils.js.map