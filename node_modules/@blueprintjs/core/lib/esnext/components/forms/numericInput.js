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
import classNames from "classnames";
import * as React from "react";
import { AbstractPureComponent, Classes, DISPLAYNAME_PREFIX, Keys, Position, removeNonHTMLProps, Utils, } from "../../common";
import * as Errors from "../../common/errors";
import { ButtonGroup } from "../button/buttonGroup";
import { Button } from "../button/buttons";
import { ControlGroup } from "./controlGroup";
import { InputGroup } from "./inputGroup";
import { clampValue, getValueOrEmptyValue, isFloatingPointNumericCharacter, isValidNumericKeyboardEvent, isValueNumeric, toMaxPrecision, } from "./numericInputUtils";
var IncrementDirection;
(function (IncrementDirection) {
    IncrementDirection[IncrementDirection["DOWN"] = -1] = "DOWN";
    IncrementDirection[IncrementDirection["UP"] = 1] = "UP";
})(IncrementDirection || (IncrementDirection = {}));
const NON_HTML_PROPS = [
    "allowNumericCharactersOnly",
    "buttonPosition",
    "clampValueOnBlur",
    "className",
    "majorStepSize",
    "minorStepSize",
    "onButtonClick",
    "onValueChange",
    "selectAllOnFocus",
    "selectAllOnIncrement",
    "stepSize",
];
export class NumericInput extends AbstractPureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            shouldSelectAfterUpdate: false,
            stepMaxPrecision: this.getStepMaxPrecision(this.props),
            value: getValueOrEmptyValue(this.props.value),
        };
        // updating these flags need not trigger re-renders, so don't include them in this.state.
        this.didPasteEventJustOccur = false;
        this.delta = 0;
        this.inputElement = null;
        this.intervalId = null;
        this.incrementButtonHandlers = this.getButtonEventHandlers(IncrementDirection.UP);
        this.decrementButtonHandlers = this.getButtonEventHandlers(IncrementDirection.DOWN);
        this.inputRef = (input) => {
            this.inputElement = input;
            Utils.safeInvoke(this.props.inputRef, input);
        };
        this.handleButtonClick = (e, direction) => {
            const delta = this.updateDelta(direction, e);
            const nextValue = this.incrementValue(delta);
            this.invokeValueCallback(nextValue, this.props.onButtonClick);
        };
        this.stopContinuousChange = () => {
            this.delta = 0;
            this.clearTimeouts();
            clearInterval(this.intervalId);
            document.removeEventListener("mouseup", this.stopContinuousChange);
        };
        this.handleContinuousChange = () => {
            const nextValue = this.incrementValue(this.delta);
            this.invokeValueCallback(nextValue, this.props.onButtonClick);
        };
        // Callbacks - Input
        // =================
        this.handleInputFocus = (e) => {
            // update this state flag to trigger update for input selection (see componentDidUpdate)
            this.setState({ shouldSelectAfterUpdate: this.props.selectAllOnFocus });
            Utils.safeInvoke(this.props.onFocus, e);
        };
        this.handleInputBlur = (e) => {
            // always disable this flag on blur so it's ready for next time.
            this.setState({ shouldSelectAfterUpdate: false });
            if (this.props.clampValueOnBlur) {
                const { value } = e.target;
                const sanitizedValue = this.getSanitizedValue(value);
                this.setState({ value: sanitizedValue });
                if (value !== sanitizedValue) {
                    this.invokeValueCallback(sanitizedValue, this.props.onValueChange);
                }
            }
            Utils.safeInvoke(this.props.onBlur, e);
        };
        this.handleInputKeyDown = (e) => {
            if (this.props.disabled || this.props.readOnly) {
                return;
            }
            const { keyCode } = e;
            let direction;
            if (keyCode === Keys.ARROW_UP) {
                direction = IncrementDirection.UP;
            }
            else if (keyCode === Keys.ARROW_DOWN) {
                direction = IncrementDirection.DOWN;
            }
            if (direction != null) {
                // when the input field has focus, some key combinations will modify
                // the field's selection range. we'll actually want to select all
                // text in the field after we modify the value on the following
                // lines. preventing the default selection behavior lets us do that
                // without interference.
                e.preventDefault();
                const delta = this.updateDelta(direction, e);
                this.incrementValue(delta);
            }
            Utils.safeInvoke(this.props.onKeyDown, e);
        };
        this.handleInputKeyPress = (e) => {
            // we prohibit keystrokes in onKeyPress instead of onKeyDown, because
            // e.key is not trustworthy in onKeyDown in all browsers.
            if (this.props.allowNumericCharactersOnly && !isValidNumericKeyboardEvent(e)) {
                e.preventDefault();
            }
            Utils.safeInvoke(this.props.onKeyPress, e);
        };
        this.handleInputPaste = (e) => {
            this.didPasteEventJustOccur = true;
            Utils.safeInvoke(this.props.onPaste, e);
        };
        this.handleInputChange = (e) => {
            const { value } = e.target;
            let nextValue = value;
            if (this.props.allowNumericCharactersOnly && this.didPasteEventJustOccur) {
                this.didPasteEventJustOccur = false;
                const valueChars = value.split("");
                const sanitizedValueChars = valueChars.filter(isFloatingPointNumericCharacter);
                const sanitizedValue = sanitizedValueChars.join("");
                nextValue = sanitizedValue;
            }
            this.setState({ shouldSelectAfterUpdate: false, value: nextValue });
            this.invokeValueCallback(nextValue, this.props.onValueChange);
        };
    }
    componentWillReceiveProps(nextProps) {
        super.componentWillReceiveProps(nextProps);
        const value = getValueOrEmptyValue(nextProps.value);
        const didMinChange = nextProps.min !== this.props.min;
        const didMaxChange = nextProps.max !== this.props.max;
        const didBoundsChange = didMinChange || didMaxChange;
        const sanitizedValue = value !== NumericInput.VALUE_EMPTY
            ? this.getSanitizedValue(value, /* delta */ 0, nextProps.min, nextProps.max)
            : NumericInput.VALUE_EMPTY;
        const stepMaxPrecision = this.getStepMaxPrecision(nextProps);
        // if a new min and max were provided that cause the existing value to fall
        // outside of the new bounds, then clamp the value to the new valid range.
        if (didBoundsChange && sanitizedValue !== this.state.value) {
            this.setState({ stepMaxPrecision, value: sanitizedValue });
            this.invokeValueCallback(sanitizedValue, this.props.onValueChange);
        }
        else {
            this.setState({ stepMaxPrecision, value });
        }
    }
    render() {
        const { buttonPosition, className, fill, large } = this.props;
        const containerClasses = classNames(Classes.NUMERIC_INPUT, { [Classes.LARGE]: large }, className);
        const buttons = this.renderButtons();
        return (React.createElement(ControlGroup, { className: containerClasses, fill: fill },
            buttonPosition === Position.LEFT && buttons,
            this.renderInput(),
            buttonPosition === Position.RIGHT && buttons));
    }
    componentDidUpdate() {
        if (this.state.shouldSelectAfterUpdate) {
            this.inputElement.setSelectionRange(0, this.state.value.length);
        }
    }
    validateProps(nextProps) {
        const { majorStepSize, max, min, minorStepSize, stepSize } = nextProps;
        if (min != null && max != null && min > max) {
            throw new Error(Errors.NUMERIC_INPUT_MIN_MAX);
        }
        if (stepSize == null) {
            throw new Error(Errors.NUMERIC_INPUT_STEP_SIZE_NULL);
        }
        if (stepSize <= 0) {
            throw new Error(Errors.NUMERIC_INPUT_STEP_SIZE_NON_POSITIVE);
        }
        if (minorStepSize && minorStepSize <= 0) {
            throw new Error(Errors.NUMERIC_INPUT_MINOR_STEP_SIZE_NON_POSITIVE);
        }
        if (majorStepSize && majorStepSize <= 0) {
            throw new Error(Errors.NUMERIC_INPUT_MAJOR_STEP_SIZE_NON_POSITIVE);
        }
        if (minorStepSize && minorStepSize > stepSize) {
            throw new Error(Errors.NUMERIC_INPUT_MINOR_STEP_SIZE_BOUND);
        }
        if (majorStepSize && majorStepSize < stepSize) {
            throw new Error(Errors.NUMERIC_INPUT_MAJOR_STEP_SIZE_BOUND);
        }
    }
    // Render Helpers
    // ==============
    renderButtons() {
        const { intent } = this.props;
        const disabled = this.props.disabled || this.props.readOnly;
        return (React.createElement(ButtonGroup, { className: Classes.FIXED, key: "button-group", vertical: true },
            React.createElement(Button, Object.assign({ disabled: disabled, icon: "chevron-up", intent: intent }, this.incrementButtonHandlers)),
            React.createElement(Button, Object.assign({ disabled: disabled, icon: "chevron-down", intent: intent }, this.decrementButtonHandlers))));
    }
    renderInput() {
        const inputGroupHtmlProps = removeNonHTMLProps(this.props, NON_HTML_PROPS, true);
        return (React.createElement(InputGroup, Object.assign({ autoComplete: "off" }, inputGroupHtmlProps, { intent: this.props.intent, inputRef: this.inputRef, large: this.props.large, leftIcon: this.props.leftIcon, onFocus: this.handleInputFocus, onBlur: this.handleInputBlur, onChange: this.handleInputChange, onKeyDown: this.handleInputKeyDown, onKeyPress: this.handleInputKeyPress, onPaste: this.handleInputPaste, rightElement: this.props.rightElement, value: this.state.value })));
    }
    // Callbacks - Buttons
    // ===================
    getButtonEventHandlers(direction) {
        return {
            // keydown is fired repeatedly when held so it's implicitly continuous
            onKeyDown: evt => {
                if (Keys.isKeyboardClick(evt.keyCode)) {
                    this.handleButtonClick(evt, direction);
                }
            },
            onMouseDown: evt => {
                this.handleButtonClick(evt, direction);
                this.startContinuousChange();
            },
        };
    }
    startContinuousChange() {
        // The button's onMouseUp event handler doesn't fire if the user
        // releases outside of the button, so we need to watch all the way
        // from the top.
        document.addEventListener("mouseup", this.stopContinuousChange);
        // Initial delay is slightly longer to prevent the user from
        // accidentally triggering the continuous increment/decrement.
        this.setTimeout(() => {
            this.intervalId = window.setInterval(this.handleContinuousChange, NumericInput.CONTINUOUS_CHANGE_INTERVAL);
        }, NumericInput.CONTINUOUS_CHANGE_DELAY);
    }
    invokeValueCallback(value, callback) {
        Utils.safeInvoke(callback, +value, value);
    }
    // Value Helpers
    // =============
    incrementValue(delta) {
        // pretend we're incrementing from 0 if currValue is empty
        const currValue = this.state.value || NumericInput.VALUE_ZERO;
        const nextValue = this.getSanitizedValue(currValue, delta);
        this.setState({ shouldSelectAfterUpdate: this.props.selectAllOnIncrement, value: nextValue });
        this.invokeValueCallback(nextValue, this.props.onValueChange);
        return nextValue;
    }
    getIncrementDelta(direction, isShiftKeyPressed, isAltKeyPressed) {
        const { majorStepSize, minorStepSize, stepSize } = this.props;
        if (isShiftKeyPressed && majorStepSize != null) {
            return direction * majorStepSize;
        }
        else if (isAltKeyPressed && minorStepSize != null) {
            return direction * minorStepSize;
        }
        else {
            return direction * stepSize;
        }
    }
    getSanitizedValue(value, delta = 0, min = this.props.min, max = this.props.max) {
        if (!isValueNumeric(value)) {
            return NumericInput.VALUE_EMPTY;
        }
        const nextValue = toMaxPrecision(parseFloat(value) + delta, this.state.stepMaxPrecision);
        return clampValue(nextValue, min, max).toString();
    }
    getStepMaxPrecision(props) {
        if (props.minorStepSize != null) {
            return Utils.countDecimalPlaces(props.minorStepSize);
        }
        else {
            return Utils.countDecimalPlaces(props.stepSize);
        }
    }
    updateDelta(direction, e) {
        this.delta = this.getIncrementDelta(direction, e.shiftKey, e.altKey);
        return this.delta;
    }
}
NumericInput.displayName = `${DISPLAYNAME_PREFIX}.NumericInput`;
NumericInput.VALUE_EMPTY = "";
NumericInput.VALUE_ZERO = "0";
NumericInput.defaultProps = {
    allowNumericCharactersOnly: true,
    buttonPosition: Position.RIGHT,
    clampValueOnBlur: false,
    large: false,
    majorStepSize: 10,
    minorStepSize: 0.1,
    selectAllOnFocus: false,
    selectAllOnIncrement: false,
    stepSize: 1,
    value: NumericInput.VALUE_EMPTY,
};
NumericInput.CONTINUOUS_CHANGE_DELAY = 300;
NumericInput.CONTINUOUS_CHANGE_INTERVAL = 100;
//# sourceMappingURL=numericInput.js.map