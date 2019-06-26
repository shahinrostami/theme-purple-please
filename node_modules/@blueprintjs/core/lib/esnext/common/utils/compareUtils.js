/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
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
/**
 * Returns true if the arrays are equal. Elements will be shallowly compared by
 * default, or they will be compared using the custom `compare` function if one
 * is provided.
 */
export function arraysEqual(arrA, arrB, compare = (a, b) => a === b) {
    // treat `null` and `undefined` as the same
    if (arrA == null && arrB == null) {
        return true;
    }
    else if (arrA == null || arrB == null || arrA.length !== arrB.length) {
        return false;
    }
    else {
        return arrA.every((a, i) => compare(a, arrB[i]));
    }
}
/**
 * Shallow comparison between objects. If `keys` is provided, just that subset
 * of keys will be compared; otherwise, all keys will be compared.
 */
export function shallowCompareKeys(objA, objB, keys) {
    // treat `null` and `undefined` as the same
    if (objA == null && objB == null) {
        return true;
    }
    else if (objA == null || objB == null) {
        return false;
    }
    else if (Array.isArray(objA) || Array.isArray(objB)) {
        return false;
    }
    else if (keys != null) {
        return _shallowCompareKeys(objA, objB, keys);
    }
    else {
        // shallowly compare all keys from both objects
        const keysA = Object.keys(objA);
        const keysB = Object.keys(objB);
        return (_shallowCompareKeys(objA, objB, { include: keysA }) && _shallowCompareKeys(objA, objB, { include: keysB }));
    }
}
/**
 * Deep comparison between objects. If `keys` is provided, just that subset of
 * keys will be compared; otherwise, all keys will be compared.
 */
export function deepCompareKeys(objA, objB, keys) {
    if (objA === objB) {
        return true;
    }
    else if (objA == null && objB == null) {
        // treat `null` and `undefined` as the same
        return true;
    }
    else if (objA == null || objB == null) {
        return false;
    }
    else if (Array.isArray(objA) || Array.isArray(objB)) {
        return arraysEqual(objA, objB, deepCompareKeys);
    }
    else if (_isSimplePrimitiveType(objA) || _isSimplePrimitiveType(objB)) {
        return objA === objB;
    }
    else if (keys != null) {
        return _deepCompareKeys(objA, objB, keys);
    }
    else if (objA.constructor !== objB.constructor) {
        return false;
    }
    else {
        const keysA = Object.keys(objA);
        const keysB = Object.keys(objB);
        if (keysA == null || keysB == null) {
            return false;
        }
        if (keysA.length === 0 && keysB.length === 0) {
            return true;
        }
        return arraysEqual(keysA, keysB) && _deepCompareKeys(objA, objB, keysA);
    }
}
/**
 * Returns a descriptive object for each key whose values are shallowly unequal
 * between two provided objects. Useful for debugging shouldComponentUpdate.
 */
export function getShallowUnequalKeyValues(objA, objB, keys) {
    // default param values let null values pass through, so we have to take
    // this more thorough approach
    const definedObjA = objA == null ? {} : objA;
    const definedObjB = objB == null ? {} : objB;
    const filteredKeys = _filterKeys(definedObjA, definedObjB, keys == null ? { exclude: [] } : keys);
    return _getUnequalKeyValues(definedObjA, definedObjB, filteredKeys, (a, b, key) => {
        return shallowCompareKeys(a, b, { include: [key] });
    });
}
/**
 * Returns a descriptive object for each key whose values are deeply unequal
 * between two provided objects. Useful for debugging shouldComponentUpdate.
 */
export function getDeepUnequalKeyValues(objA = {}, objB = {}, keys) {
    const filteredKeys = keys == null ? _unionKeys(objA, objB) : keys;
    return _getUnequalKeyValues(objA, objB, filteredKeys, (a, b, key) => {
        return deepCompareKeys(a, b, [key]);
    });
}
// Private helpers
// ===============
/**
 * Partial shallow comparison between objects using the given list of keys.
 */
function _shallowCompareKeys(objA, objB, keys) {
    return _filterKeys(objA, objB, keys).every(key => {
        return objA.hasOwnProperty(key) === objB.hasOwnProperty(key) && objA[key] === objB[key];
    });
}
/**
 * Partial deep comparison between objects using the given list of keys.
 */
function _deepCompareKeys(objA, objB, keys) {
    return keys.every(key => {
        return objA.hasOwnProperty(key) === objB.hasOwnProperty(key) && deepCompareKeys(objA[key], objB[key]);
    });
}
function _isSimplePrimitiveType(value) {
    return typeof value === "number" || typeof value === "string" || typeof value === "boolean";
}
function _filterKeys(objA, objB, keys) {
    if (_isWhitelist(keys)) {
        return keys.include;
    }
    else {
        const keysA = Object.keys(objA);
        const keysB = Object.keys(objB);
        // merge keys from both objects into a big set for quick access
        const keySet = _arrayToObject(keysA.concat(keysB));
        // delete blacklisted keys from the key set
        keys.exclude.forEach(key => delete keySet[key]);
        // return the remaining keys as an array
        return Object.keys(keySet);
    }
}
function _isWhitelist(keys) {
    return keys != null && keys.include != null;
}
function _arrayToObject(arr) {
    return arr.reduce((obj, element) => {
        obj[element] = true;
        return obj;
    }, {});
}
function _getUnequalKeyValues(objA, objB, keys, compareFn) {
    const unequalKeys = keys.filter(key => !compareFn(objA, objB, key));
    const unequalKeyValues = unequalKeys.map(key => ({
        key,
        valueA: objA[key],
        valueB: objB[key],
    }));
    return unequalKeyValues;
}
function _unionKeys(objA, objB) {
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    const concatKeys = keysA.concat(keysB);
    const keySet = _arrayToObject(concatKeys);
    return Object.keys(keySet);
}
//# sourceMappingURL=compareUtils.js.map