"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var classnames_1 = tslib_1.__importDefault(require("classnames"));
var common_1 = require("../../common");
var errors_1 = require("../../common/errors");
var utils_1 = require("../../common/utils");
var html_1 = require("../html/html");
var hotkey_1 = require("./hotkey");
var hotkey_2 = require("./hotkey");
exports.Hotkey = hotkey_2.Hotkey;
var keyCombo_1 = require("./keyCombo");
exports.KeyCombo = keyCombo_1.KeyCombo;
var hotkeysTarget_1 = require("./hotkeysTarget");
exports.HotkeysTarget = hotkeysTarget_1.HotkeysTarget;
var hotkeyParser_1 = require("./hotkeyParser");
exports.comboMatches = hotkeyParser_1.comboMatches;
exports.getKeyCombo = hotkeyParser_1.getKeyCombo;
exports.getKeyComboString = hotkeyParser_1.getKeyComboString;
exports.parseKeyCombo = hotkeyParser_1.parseKeyCombo;
var hotkeysDialog_1 = require("./hotkeysDialog");
exports.hideHotkeysDialog = hotkeysDialog_1.hideHotkeysDialog;
exports.setHotkeysDialogProps = hotkeysDialog_1.setHotkeysDialogProps;
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
                elems.push(React.createElement(html_1.H4, { key: "group-" + elems.length }, groupLabel));
                lastGroup = groupLabel;
            }
            elems.push(React.createElement(hotkey_1.Hotkey, tslib_1.__assign({ key: elems.length }, hotkey)));
        }
        var rootClasses = classnames_1.default(common_1.Classes.HOTKEY_COLUMN, this.props.className);
        return React.createElement("div", { className: rootClasses }, elems);
    };
    Hotkeys.prototype.validateProps = function (props) {
        React.Children.forEach(props.children, function (child) {
            if (!utils_1.isElementOfType(child, hotkey_1.Hotkey)) {
                throw new Error(errors_1.HOTKEYS_HOTKEY_CHILDREN);
            }
        });
    };
    Hotkeys.displayName = common_1.DISPLAYNAME_PREFIX + ".Hotkeys";
    Hotkeys.defaultProps = {
        tabIndex: 0,
    };
    return Hotkeys;
}(common_1.AbstractPureComponent));
exports.Hotkeys = Hotkeys;
//# sourceMappingURL=hotkeys.js.map