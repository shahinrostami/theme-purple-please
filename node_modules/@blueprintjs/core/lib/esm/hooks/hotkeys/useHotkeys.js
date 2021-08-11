/*
 * Copyright 2021 Palantir Technologies, Inc. All rights reserved.
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
import { __spreadArrays } from "tslib";
import * as React from "react";
import { comboMatches, getKeyCombo, parseKeyCombo } from "../../components/hotkeys/hotkeyParser";
import { HotkeysContext } from "../../context";
/**
 * React hook to register global and local hotkeys for a component.
 *
 * @param keys list of hotkeys to configure
 * @param options hook options
 */
export function useHotkeys(keys, options) {
    if (options === void 0) { options = {}; }
    var _a = options.document, document = _a === void 0 ? getDefaultDocument() : _a, _b = options.showDialogKeyCombo, showDialogKeyCombo = _b === void 0 ? "?" : _b;
    var localKeys = React.useMemo(function () {
        return keys
            .filter(function (k) { return !k.global; })
            .map(function (k) { return ({
            combo: parseKeyCombo(k.combo),
            config: k,
        }); });
    }, [keys]);
    var globalKeys = React.useMemo(function () {
        return keys
            .filter(function (k) { return k.global; })
            .map(function (k) { return ({
            combo: parseKeyCombo(k.combo),
            config: k,
        }); });
    }, [keys]);
    // register keys with global context
    var _c = React.useContext(HotkeysContext), dispatch = _c[1];
    React.useEffect(function () {
        var payload = __spreadArrays(globalKeys.map(function (k) { return k.config; }), localKeys.map(function (k) { return k.config; }));
        dispatch({ type: "ADD_HOTKEYS", payload: payload });
        return function () { return dispatch({ type: "REMOVE_HOTKEYS", payload: payload }); };
    }, [keys]);
    var invokeNamedCallbackIfComboRecognized = function (global, combo, callbackName, e) {
        var _a, _b;
        var isTextInput = isTargetATextInput(e);
        for (var _i = 0, _c = global ? globalKeys : localKeys; _i < _c.length; _i++) {
            var key = _c[_i];
            var _d = key.config, _e = _d.allowInInput, allowInInput = _e === void 0 ? false : _e, _f = _d.disabled, disabled = _f === void 0 ? false : _f, _g = _d.preventDefault, preventDefault = _g === void 0 ? false : _g, _h = _d.stopPropagation, stopPropagation = _h === void 0 ? false : _h;
            var shouldIgnore = (isTextInput && !allowInInput) || disabled;
            if (!shouldIgnore && comboMatches(key.combo, combo)) {
                if (preventDefault) {
                    e.preventDefault();
                }
                if (stopPropagation) {
                    // set a flag just for unit testing. not meant to be referenced in feature work.
                    e.isPropagationStopped = true;
                    e.stopPropagation();
                }
                (_b = (_a = key.config)[callbackName]) === null || _b === void 0 ? void 0 : _b.call(_a, e);
            }
        }
    };
    var handleGlobalKeyDown = React.useCallback(function (e) {
        // special case for global keydown: if '?' is pressed, open the hotkeys dialog
        var combo = getKeyCombo(e);
        var isTextInput = isTargetATextInput(e);
        if (!isTextInput && comboMatches(parseKeyCombo(showDialogKeyCombo), combo)) {
            dispatch({ type: "OPEN_DIALOG" });
        }
        else {
            invokeNamedCallbackIfComboRecognized(true, getKeyCombo(e), "onKeyDown", e);
        }
    }, [globalKeys]);
    var handleGlobalKeyUp = React.useCallback(function (e) { return invokeNamedCallbackIfComboRecognized(true, getKeyCombo(e), "onKeyUp", e); }, [globalKeys]);
    var handleLocalKeyDown = React.useCallback(function (e) {
        return invokeNamedCallbackIfComboRecognized(false, getKeyCombo(e.nativeEvent), "onKeyDown", e.nativeEvent);
    }, [localKeys]);
    var handleLocalKeyUp = React.useCallback(function (e) {
        return invokeNamedCallbackIfComboRecognized(false, getKeyCombo(e.nativeEvent), "onKeyUp", e.nativeEvent);
    }, [localKeys]);
    React.useEffect(function () {
        // document is guaranteed to be defined inside effects
        document.addEventListener("keydown", handleGlobalKeyDown);
        document.addEventListener("keyup", handleGlobalKeyUp);
        return function () {
            document.removeEventListener("keydown", handleGlobalKeyDown);
            document.removeEventListener("keyup", handleGlobalKeyUp);
        };
    }, [handleGlobalKeyDown, handleGlobalKeyUp]);
    return { handleKeyDown: handleLocalKeyDown, handleKeyUp: handleLocalKeyUp };
}
/**
 * @returns true if the event target is a text input which should take priority over hotkey bindings
 */
function isTargetATextInput(e) {
    var elem = e.target;
    // we check these cases for unit testing, but this should not happen
    // during normal operation
    if (elem == null || elem.closest == null) {
        return false;
    }
    var editable = elem.closest("input, textarea, [contenteditable=true]");
    if (editable == null) {
        return false;
    }
    // don't let checkboxes, switches, and radio buttons prevent hotkey behavior
    if (editable.tagName.toLowerCase() === "input") {
        var inputType = editable.type;
        if (inputType === "checkbox" || inputType === "radio") {
            return false;
        }
    }
    // don't let read-only fields prevent hotkey behavior
    if (editable.readOnly) {
        return false;
    }
    return true;
}
function getDefaultDocument() {
    if (typeof window === "undefined") {
        return undefined;
    }
    return window.document;
}
//# sourceMappingURL=useHotkeys.js.map