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
// we need some empty interfaces to show up in docs
// HACKHACK: these components should go in separate files
// tslint:disable max-classes-per-file no-empty-interface
import classNames from "classnames";
import * as React from "react";
import * as Classes from "../../common/classes";
import { DISPLAYNAME_PREFIX } from "../../common/props";
import { safeInvoke } from "../../common/utils";
/**
 * Renders common control elements, with additional props to customize appearance.
 * This component is not exported and is only used in this file for `Checkbox`, `Radio`, and `Switch` below.
 */
var Control = function (_a) {
    var alignIndicator = _a.alignIndicator, children = _a.children, className = _a.className, indicatorChildren = _a.indicatorChildren, inline = _a.inline, inputRef = _a.inputRef, label = _a.label, labelElement = _a.labelElement, large = _a.large, style = _a.style, type = _a.type, typeClassName = _a.typeClassName, _b = _a.tagName, TagName = _b === void 0 ? "label" : _b, htmlProps = tslib_1.__rest(_a, ["alignIndicator", "children", "className", "indicatorChildren", "inline", "inputRef", "label", "labelElement", "large", "style", "type", "typeClassName", "tagName"]);
    var classes = classNames(Classes.CONTROL, typeClassName, (_c = {},
        _c[Classes.DISABLED] = htmlProps.disabled,
        _c[Classes.INLINE] = inline,
        _c[Classes.LARGE] = large,
        _c), Classes.alignmentClass(alignIndicator), className);
    return (React.createElement(TagName, { className: classes, style: style },
        React.createElement("input", tslib_1.__assign({}, htmlProps, { ref: inputRef, type: type })),
        React.createElement("span", { className: Classes.CONTROL_INDICATOR }, indicatorChildren),
        label,
        labelElement,
        children));
    var _c;
};
var Switch = /** @class */ (function (_super) {
    tslib_1.__extends(Switch, _super);
    function Switch() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Switch.prototype.render = function () {
        var _a = this.props, innerLabelChecked = _a.innerLabelChecked, innerLabel = _a.innerLabel, controlProps = tslib_1.__rest(_a, ["innerLabelChecked", "innerLabel"]);
        var switchLabels = innerLabel || innerLabelChecked
            ? [
                React.createElement("div", { key: "checked", className: Classes.CONTROL_INDICATOR_CHILD },
                    React.createElement("div", { className: Classes.SWITCH_INNER_TEXT }, innerLabelChecked ? innerLabelChecked : innerLabel)),
                React.createElement("div", { key: "unchecked", className: Classes.CONTROL_INDICATOR_CHILD },
                    React.createElement("div", { className: Classes.SWITCH_INNER_TEXT }, innerLabel)),
            ]
            : null;
        return (React.createElement(Control, tslib_1.__assign({}, controlProps, { type: "checkbox", typeClassName: Classes.SWITCH, indicatorChildren: switchLabels })));
    };
    Switch.displayName = DISPLAYNAME_PREFIX + ".Switch";
    return Switch;
}(React.PureComponent));
export { Switch };
var Radio = /** @class */ (function (_super) {
    tslib_1.__extends(Radio, _super);
    function Radio() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Radio.prototype.render = function () {
        return React.createElement(Control, tslib_1.__assign({}, this.props, { type: "radio", typeClassName: Classes.RADIO }));
    };
    Radio.displayName = DISPLAYNAME_PREFIX + ".Radio";
    return Radio;
}(React.PureComponent));
export { Radio };
var Checkbox = /** @class */ (function (_super) {
    tslib_1.__extends(Checkbox, _super);
    function Checkbox() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            indeterminate: _this.props.indeterminate || _this.props.defaultIndeterminate || false,
        };
        _this.handleChange = function (evt) {
            var indeterminate = evt.target.indeterminate;
            // update state immediately only if uncontrolled
            if (_this.props.indeterminate == null) {
                _this.setState({ indeterminate: indeterminate });
            }
            // otherwise wait for props change. always invoke handler.
            safeInvoke(_this.props.onChange, evt);
        };
        _this.handleInputRef = function (ref) {
            _this.input = ref;
            safeInvoke(_this.props.inputRef, ref);
        };
        return _this;
    }
    Checkbox.prototype.render = function () {
        var _a = this.props, defaultIndeterminate = _a.defaultIndeterminate, indeterminate = _a.indeterminate, controlProps = tslib_1.__rest(_a, ["defaultIndeterminate", "indeterminate"]);
        return (React.createElement(Control, tslib_1.__assign({}, controlProps, { inputRef: this.handleInputRef, onChange: this.handleChange, type: "checkbox", typeClassName: Classes.CHECKBOX })));
    };
    Checkbox.prototype.componentWillReceiveProps = function (_a) {
        var indeterminate = _a.indeterminate;
        // put props into state if controlled by props
        if (indeterminate != null) {
            this.setState({ indeterminate: indeterminate });
        }
    };
    Checkbox.prototype.componentDidMount = function () {
        this.updateIndeterminate();
    };
    Checkbox.prototype.componentDidUpdate = function () {
        this.updateIndeterminate();
    };
    Checkbox.prototype.updateIndeterminate = function () {
        if (this.input != null) {
            this.input.indeterminate = this.state.indeterminate;
        }
    };
    Checkbox.displayName = DISPLAYNAME_PREFIX + ".Checkbox";
    return Checkbox;
}(React.PureComponent));
export { Checkbox };
//# sourceMappingURL=controls.js.map