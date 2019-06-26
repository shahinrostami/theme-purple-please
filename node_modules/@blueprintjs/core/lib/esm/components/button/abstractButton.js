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
import * as tslib_1 from "tslib";
import classNames from "classnames";
import * as React from "react";
import * as Classes from "../../common/classes";
import * as Keys from "../../common/keys";
import { isReactNodeEmpty, safeInvoke } from "../../common/utils";
import { Icon } from "../icon/icon";
import { Spinner } from "../spinner/spinner";
var AbstractButton = /** @class */ (function (_super) {
    tslib_1.__extends(AbstractButton, _super);
    function AbstractButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isActive: false,
        };
        _this.refHandlers = {
            button: function (ref) {
                _this.buttonRef = ref;
                safeInvoke(_this.props.elementRef, ref);
            },
        };
        _this.currentKeyDown = null;
        // we're casting as `any` to get around a somewhat opaque safeInvoke error
        // that "Type argument candidate 'KeyboardEvent<T>' is not a valid type
        // argument because it is not a supertype of candidate
        // 'KeyboardEvent<HTMLElement>'."
        _this.handleKeyDown = function (e) {
            if (Keys.isKeyboardClick(e.which)) {
                e.preventDefault();
                if (e.which !== _this.currentKeyDown) {
                    _this.setState({ isActive: true });
                }
            }
            _this.currentKeyDown = e.which;
            safeInvoke(_this.props.onKeyDown, e);
        };
        _this.handleKeyUp = function (e) {
            if (Keys.isKeyboardClick(e.which)) {
                _this.setState({ isActive: false });
                _this.buttonRef.click();
            }
            _this.currentKeyDown = null;
            safeInvoke(_this.props.onKeyUp, e);
        };
        return _this;
    }
    AbstractButton.prototype.getCommonButtonProps = function () {
        var _a = this.props, alignText = _a.alignText, fill = _a.fill, large = _a.large, loading = _a.loading, minimal = _a.minimal, small = _a.small, tabIndex = _a.tabIndex;
        var disabled = this.props.disabled || loading;
        var className = classNames(Classes.BUTTON, (_b = {},
            _b[Classes.ACTIVE] = this.state.isActive || this.props.active,
            _b[Classes.DISABLED] = disabled,
            _b[Classes.FILL] = fill,
            _b[Classes.LARGE] = large,
            _b[Classes.LOADING] = loading,
            _b[Classes.MINIMAL] = minimal,
            _b[Classes.SMALL] = small,
            _b), Classes.alignmentClass(alignText), Classes.intentClass(this.props.intent), this.props.className);
        return {
            className: className,
            disabled: disabled,
            onClick: disabled ? undefined : this.props.onClick,
            onKeyDown: this.handleKeyDown,
            onKeyUp: this.handleKeyUp,
            ref: this.refHandlers.button,
            tabIndex: disabled ? -1 : tabIndex,
        };
        var _b;
    };
    AbstractButton.prototype.renderChildren = function () {
        var _a = this.props, children = _a.children, icon = _a.icon, loading = _a.loading, rightIcon = _a.rightIcon, text = _a.text;
        return [
            loading && React.createElement(Spinner, { key: "loading", className: Classes.BUTTON_SPINNER, size: Icon.SIZE_LARGE }),
            React.createElement(Icon, { key: "leftIcon", icon: icon }),
            (!isReactNodeEmpty(text) || !isReactNodeEmpty(children)) && (React.createElement("span", { key: "text", className: Classes.BUTTON_TEXT },
                text,
                children)),
            React.createElement(Icon, { key: "rightIcon", icon: rightIcon }),
        ];
    };
    return AbstractButton;
}(React.PureComponent));
export { AbstractButton };
//# sourceMappingURL=abstractButton.js.map