/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
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
import { DISABLED, FILL, HTML_SELECT, LARGE, MINIMAL } from "../../common/classes";
import { Icon } from "../icon/icon";
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var HTMLSelect = /** @class */ (function (_super) {
    tslib_1.__extends(HTMLSelect, _super);
    function HTMLSelect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HTMLSelect.prototype.render = function () {
        var _a = this.props, className = _a.className, disabled = _a.disabled, elementRef = _a.elementRef, fill = _a.fill, iconProps = _a.iconProps, large = _a.large, minimal = _a.minimal, _b = _a.options, options = _b === void 0 ? [] : _b, htmlProps = tslib_1.__rest(_a, ["className", "disabled", "elementRef", "fill", "iconProps", "large", "minimal", "options"]);
        var classes = classNames(HTML_SELECT, (_c = {},
            _c[DISABLED] = disabled,
            _c[FILL] = fill,
            _c[LARGE] = large,
            _c[MINIMAL] = minimal,
            _c), className);
        var optionChildren = options.map(function (option) {
            var props = typeof option === "object" ? option : { value: option };
            return React.createElement("option", tslib_1.__assign({}, props, { key: props.value, children: props.label || props.value }));
        });
        return (React.createElement("div", { className: classes },
            React.createElement("select", tslib_1.__assign({ disabled: disabled, ref: elementRef }, htmlProps, { multiple: false }),
                optionChildren,
                htmlProps.children),
            React.createElement(Icon, tslib_1.__assign({ icon: "double-caret-vertical" }, iconProps))));
        var _c;
    };
    return HTMLSelect;
}(React.PureComponent));
export { HTMLSelect };
//# sourceMappingURL=htmlSelect.js.map