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
import * as tslib_1 from "tslib";
import classNames from "classnames";
import * as React from "react";
import * as Classes from "../../common/classes";
import { Position } from "../../common/position";
import { DISPLAYNAME_PREFIX } from "../../common/props";
import { Icon } from "../icon/icon";
import { Popover, PopoverInteractionKind } from "../popover/popover";
import { Text } from "../text/text";
import { Menu } from "./menu";
var MenuItem = /** @class */ (function (_super) {
    tslib_1.__extends(MenuItem, _super);
    function MenuItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MenuItem.prototype.render = function () {
        var _a = this.props, active = _a.active, className = _a.className, children = _a.children, disabled = _a.disabled, icon = _a.icon, intent = _a.intent, labelElement = _a.labelElement, multiline = _a.multiline, popoverProps = _a.popoverProps, shouldDismissPopover = _a.shouldDismissPopover, text = _a.text, textClassName = _a.textClassName, _b = _a.tagName, TagName = _b === void 0 ? "a" : _b, htmlProps = tslib_1.__rest(_a, ["active", "className", "children", "disabled", "icon", "intent", "labelElement", "multiline", "popoverProps", "shouldDismissPopover", "text", "textClassName", "tagName"]);
        var hasSubmenu = children != null;
        var intentClass = Classes.intentClass(intent);
        var anchorClasses = classNames(Classes.MENU_ITEM, intentClass, (_c = {},
            _c[Classes.ACTIVE] = active,
            _c[Classes.INTENT_PRIMARY] = active && intentClass == null,
            _c[Classes.DISABLED] = disabled,
            // prevent popover from closing when clicking on submenu trigger or disabled item
            _c[Classes.POPOVER_DISMISS] = shouldDismissPopover && !disabled && !hasSubmenu,
            _c), className);
        var target = (React.createElement(TagName, tslib_1.__assign({}, htmlProps, (disabled ? DISABLED_PROPS : {}), { className: anchorClasses }),
            React.createElement(Icon, { icon: icon }),
            React.createElement(Text, { className: classNames(Classes.FILL, textClassName), ellipsize: !multiline }, text),
            this.maybeRenderLabel(labelElement),
            hasSubmenu && React.createElement(Icon, { icon: "caret-right" })));
        var liClasses = classNames((_d = {}, _d[Classes.MENU_SUBMENU] = hasSubmenu, _d));
        return React.createElement("li", { className: liClasses }, this.maybeRenderPopover(target, children));
        var _c, _d;
    };
    MenuItem.prototype.maybeRenderLabel = function (labelElement) {
        var _a = this.props, label = _a.label, labelClassName = _a.labelClassName;
        if (label == null && labelElement == null) {
            return null;
        }
        return (React.createElement("span", { className: classNames(Classes.MENU_ITEM_LABEL, labelClassName) },
            label,
            labelElement));
    };
    MenuItem.prototype.maybeRenderPopover = function (target, children) {
        if (children == null) {
            return target;
        }
        var _a = this.props, disabled = _a.disabled, popoverProps = _a.popoverProps;
        return (React.createElement(Popover, tslib_1.__assign({ autoFocus: false, captureDismiss: false, disabled: disabled, enforceFocus: false, hoverCloseDelay: 0, interactionKind: PopoverInteractionKind.HOVER, modifiers: SUBMENU_POPOVER_MODIFIERS, position: Position.RIGHT_TOP, usePortal: false }, popoverProps, { content: React.createElement(Menu, null, children), minimal: true, popoverClassName: classNames(Classes.MENU_SUBMENU, popoverProps.popoverClassName), target: target })));
    };
    MenuItem.defaultProps = {
        disabled: false,
        multiline: false,
        popoverProps: {},
        shouldDismissPopover: true,
        text: "",
    };
    MenuItem.displayName = DISPLAYNAME_PREFIX + ".MenuItem";
    return MenuItem;
}(React.PureComponent));
export { MenuItem };
var SUBMENU_POPOVER_MODIFIERS = {
    // 20px padding - scrollbar width + a bit
    flip: { boundariesElement: "viewport", padding: 20 },
    // shift popover up 5px so MenuItems align
    offset: { offset: -5 },
    preventOverflow: { boundariesElement: "viewport", padding: 20 },
};
// props to ignore when disabled
var DISABLED_PROPS = {
    href: undefined,
    onClick: undefined,
    onMouseDown: undefined,
    onMouseEnter: undefined,
    onMouseLeave: undefined,
    tabIndex: -1,
};
//# sourceMappingURL=menuItem.js.map