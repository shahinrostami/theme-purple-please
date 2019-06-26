/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
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
import * as tslib_1 from "tslib";
import * as React from "react";
import classNames from "classnames";
import { AbstractPureComponent, Classes, DISPLAYNAME_PREFIX } from "../../common";
import { HOTKEYS_HOTKEY_CHILDREN } from "../../common/errors";
import { isElementOfType } from "../../common/utils";
import { H4 } from "../html/html";
import { Hotkey } from "./hotkey";
export { Hotkey } from "./hotkey";
export { KeyCombo } from "./keyCombo";
export { HotkeysTarget } from "./hotkeysTarget";
export { comboMatches, getKeyCombo, getKeyComboString, parseKeyCombo } from "./hotkeyParser";
export { hideHotkeysDialog, setHotkeysDialogProps } from "./hotkeysDialog";
var Hotkeys = /** @class */ (function (_super) {
    tslib_1.__extends(Hotkeys, _super);
    function Hotkeys() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Hotkeys.prototype.render = function () {
        var hotkeys = React.Children.map(this.props.children, function (child) { return child.props; });
        // sort by group label alphabetically, prioritize globals
        hotkeys.sort(function (a, b) {
            if (a.global === b.global) {
                return a.group.localeCompare(b.group);
            }
            return a.global ? -1 : 1;
        });
        var lastGroup = null;
        var elems = [];
        for (var _i = 0, hotkeys_1 = hotkeys; _i < hotkeys_1.length; _i++) {
            var hotkey = hotkeys_1[_i];
            var groupLabel = hotkey.group;
            if (groupLabel !== lastGroup) {
                elems.push(React.createElement(H4, { key: "group-" + elems.length }, groupLabel));
                lastGroup = groupLabel;
            }
            elems.push(React.createElement(Hotkey, tslib_1.__assign({ key: elems.length }, hotkey)));
        }
        var rootClasses = classNames(Classes.HOTKEY_COLUMN, this.props.className);
        return React.createElement("div", { className: rootClasses }, elems);
    };
    Hotkeys.prototype.validateProps = function (props) {
        React.Children.forEach(props.children, function (child) {
            if (!isElementOfType(child, Hotkey)) {
                throw new Error(HOTKEYS_HOTKEY_CHILDREN);
            }
        });
    };
    Hotkeys.displayName = DISPLAYNAME_PREFIX + ".Hotkeys";
    Hotkeys.defaultProps = {
        tabIndex: 0,
    };
    return Hotkeys;
}(AbstractPureComponent));
export { Hotkeys };
//# sourceMappingURL=hotkeys.js.map