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
const Control = ({ alignIndicator, children, className, indicatorChildren, inline, inputRef, label, labelElement, large, style, type, typeClassName, tagName: TagName = "label", ...htmlProps }) => {
    const classes = classNames(Classes.CONTROL, typeClassName, {
        [Classes.DISABLED]: htmlProps.disabled,
        [Classes.INLINE]: inline,
        [Classes.LARGE]: large,
    }, Classes.alignmentClass(alignIndicator), className);
    return (React.createElement(TagName, { className: classes, style: style },
        React.createElement("input", Object.assign({}, htmlProps, { ref: inputRef, type: type })),
        React.createElement("span", { className: Classes.CONTROL_INDICATOR }, indicatorChildren),
        label,
        labelElement,
        children));
};
export class Switch extends React.PureComponent {
    render() {
        const { innerLabelChecked, innerLabel, ...controlProps } = this.props;
        const switchLabels = innerLabel || innerLabelChecked
            ? [
                React.createElement("div", { key: "checked", className: Classes.CONTROL_INDICATOR_CHILD },
                    React.createElement("div", { className: Classes.SWITCH_INNER_TEXT }, innerLabelChecked ? innerLabelChecked : innerLabel)),
                React.createElement("div", { key: "unchecked", className: Classes.CONTROL_INDICATOR_CHILD },
                    React.createElement("div", { className: Classes.SWITCH_INNER_TEXT }, innerLabel)),
            ]
            : null;
        return (React.createElement(Control, Object.assign({}, controlProps, { type: "checkbox", typeClassName: Classes.SWITCH, indicatorChildren: switchLabels })));
    }
}
Switch.displayName = `${DISPLAYNAME_PREFIX}.Switch`;
export class Radio extends React.PureComponent {
    render() {
        return React.createElement(Control, Object.assign({}, this.props, { type: "radio", typeClassName: Classes.RADIO }));
    }
}
Radio.displayName = `${DISPLAYNAME_PREFIX}.Radio`;
export class Checkbox extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            indeterminate: this.props.indeterminate || this.props.defaultIndeterminate || false,
        };
        this.handleChange = (evt) => {
            const { indeterminate } = evt.target;
            // update state immediately only if uncontrolled
            if (this.props.indeterminate == null) {
                this.setState({ indeterminate });
            }
            // otherwise wait for props change. always invoke handler.
            safeInvoke(this.props.onChange, evt);
        };
        this.handleInputRef = (ref) => {
            this.input = ref;
            safeInvoke(this.props.inputRef, ref);
        };
    }
    render() {
        const { defaultIndeterminate, indeterminate, ...controlProps } = this.props;
        return (React.createElement(Control, Object.assign({}, controlProps, { inputRef: this.handleInputRef, onChange: this.handleChange, type: "checkbox", typeClassName: Classes.CHECKBOX })));
    }
    componentWillReceiveProps({ indeterminate }) {
        // put props into state if controlled by props
        if (indeterminate != null) {
            this.setState({ indeterminate });
        }
    }
    componentDidMount() {
        this.updateIndeterminate();
    }
    componentDidUpdate() {
        this.updateIndeterminate();
    }
    updateIndeterminate() {
        if (this.input != null) {
            this.input.indeterminate = this.state.indeterminate;
        }
    }
}
Checkbox.displayName = `${DISPLAYNAME_PREFIX}.Checkbox`;
//# sourceMappingURL=controls.js.map