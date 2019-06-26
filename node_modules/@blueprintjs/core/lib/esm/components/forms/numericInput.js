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
var NON_HTML_PROPS = [
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
var NumericInput = /** @class */ (function (_super) {
    tslib_1.__extends(NumericInput, _super);
    function NumericInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            shouldSelectAfterUpdate: false,
            stepMaxPrecision: _this.getStepMaxPrecision(_this.props),
            value: getValueOrEmptyValue(_this.props.value),
        };
        // updating these flags need not trigger re-renders, so don't include them in this.state.
        _this.didPasteEventJustOccur = false;
        _this.delta = 0;
        _this.inputElement = null;
        _this.intervalId = null;
        _this.incrementButtonHandlers = _this.getButtonEventHandlers(IncrementDirection.UP);
        _this.decrementButtonHandlers = _this.getButtonEventHandlers(IncrementDirection.DOWN);
        _this.inputRef = function (input) {
            _this.inputElement = input;
            Utils.safeInvoke(_this.props.inputRef, input);
        };
        _this.handleButtonClick = function (e, direction) {
            var delta = _this.updateDelta(direction, e);
            var nextValue = _this.incrementValue(delta);
            _this.invokeValueCallback(nextValue, _this.props.onButtonClick);
        };
        _this.stopContinuousChange = function () {
            _this.delta = 0;
            _this.clearTimeouts();
            clearInterval(_this.intervalId);
            document.removeEventListener("mouseup", _this.stopContinuousChange);
        };
        _this.handleContinuousChange = function () {
            var nextValue = _this.incrementValue(_this.delta);
            _this.invokeValueCallback(nextValue, _this.props.onButtonClick);
        };
        // Callbacks - Input
        // =================
        _this.handleInputFocus = function (e) {
            // update this state flag to trigger update for input selection (see componentDidUpdate)
            _this.setState({ shouldSelectAfterUpdate: _this.props.selectAllOnFocus });
            Utils.safeInvoke(_this.props.onFocus, e);
        };
        _this.handleInputBlur = function (e) {
            // always disable this flag on blur so it's ready for next time.
            _this.setState({ shouldSelectAfterUpdate: false });
            if (_this.props.clampValueOnBlur) {
                var value = e.target.value;
                var sanitizedValue = _this.getSanitizedValue(value);
                _this.setState({ value: sanitizedValue });
                if (value !== sanitizedValue) {
                    _this.invokeValueCallback(sanitizedValue, _this.props.onValueChange);
                }
            }
            Utils.safeInvoke(_this.props.onBlur, e);
        };
        _this.handleInputKeyDown = function (e) {
            if (_this.props.disabled || _this.props.readOnly) {
                return;
            }
            var keyCode = e.keyCode;
            var direction;
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
                var delta = _this.updateDelta(direction, e);
                _this.incrementValue(delta);
            }
            Utils.safeInvoke(_this.props.onKeyDown, e);
        };
        _this.handleInputKeyPress = function (e) {
            // we prohibit keystrokes in onKeyPress instead of onKeyDown, because
            // e.key is not trustworthy in onKeyDown in all browsers.
            if (_this.props.allowNumericCharactersOnly && !isValidNumericKeyboardEvent(e)) {
                e.preventDefault();
            }
            Utils.safeInvoke(_this.props.onKeyPress, e);
        };
        _this.handleInputPaste = function (e) {
            _this.didPasteEventJustOccur = true;
            Utils.safeInvoke(_this.props.onPaste, e);
        };
        _this.handleInputChange = function (e) {
            var value = e.target.value;
            var nextValue = value;
            if (_this.props.allowNumericCharactersOnly && _this.didPasteEventJustOccur) {
                _this.didPasteEventJustOccur = false;
                var valueChars = value.split("");
                var sanitizedValueChars = valueChars.filter(isFloatingPointNumericCharacter);
                var sanitizedValue = sanitizedValueChars.join("");
                nextValue = sanitizedValue;
            }
            _this.setState({ shouldSelectAfterUpdate: false, value: nextValue });
            _this.invokeValueCallback(nextValue, _this.props.onValueChange);
        };
        return _this;
    }
    NumericInput.prototype.componentWillReceiveProps = function (nextProps) {
        _super.prototype.componentWillReceiveProps.call(this, nextProps);
        var value = getValueOrEmptyValue(nextProps.value);
        var didMinChange = nextProps.min !== this.props.min;
        var didMaxChange = nextProps.max !== this.props.max;
        var didBoundsChange = didMinChange || didMaxChange;
        var sanitizedValue = value !== NumericInput.VALUE_EMPTY
            ? this.getSanitizedValue(value, /* delta */ 0, nextProps.min, nextProps.max)
            : NumericInput.VALUE_EMPTY;
        var stepMaxPrecision = this.getStepMaxPrecision(nextProps);
        // if a new min and max were provided that cause the existing value to fall
        // outside of the new bounds, then clamp the value to the new valid range.
        if (didBoundsChange && sanitizedValue !== this.state.value) {
            this.setState({ stepMaxPrecision: stepMaxPrecision, value: sanitizedValue });
            this.invokeValueCallback(sanitizedValue, this.props.onValueChange);
        }
        else {
            this.setState({ stepMaxPrecision: stepMaxPrecision, value: value });
        }
    };
    NumericInput.prototype.render = function () {
        var _a = this.props, buttonPosition = _a.buttonPosition, className = _a.className, fill = _a.fill, large = _a.large;
        var containerClasses = classNames(Classes.NUMERIC_INPUT, (_b = {}, _b[Classes.LARGE] = large, _b), className);
        var buttons = this.renderButtons();
        return (React.createElement(ControlGroup, { className: containerClasses, fill: fill },
            buttonPosition === Position.LEFT && buttons,
            this.renderInput(),
            buttonPosition === Position.RIGHT && buttons));
        var _b;
    };
    NumericInput.prototype.componentDidUpdate = function () {
        if (this.state.shouldSelectAfterUpdate) {
            this.inputElement.setSelectionRange(0, this.state.value.length);
        }
    };
    NumericInput.prototype.validateProps = function (nextProps) {
        var majorStepSize = nextProps.majorStepSize, max = nextProps.max, min = nextProps.min, minorStepSize = nextProps.minorStepSize, stepSize = nextProps.stepSize;
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
    };
    // Render Helpers
    // ==============
    NumericInput.prototype.renderButtons = function () {
        var intent = this.props.intent;
        var disabled = this.props.disabled || this.props.readOnly;
        return (React.createElement(ButtonGroup, { className: Classes.FIXED, key: "button-group", vertical: true },
            React.createElement(Button, tslib_1.__assign({ disabled: disabled, icon: "chevron-up", intent: intent }, this.incrementButtonHandlers)),
            React.createElement(Button, tslib_1.__assign({ disabled: disabled, icon: "chevron-down", intent: intent }, this.decrementButtonHandlers))));
    };
    NumericInput.prototype.renderInput = function () {
        var inputGroupHtmlProps = removeNonHTMLProps(this.props, NON_HTML_PROPS, true);
        return (React.createElement(InputGroup, tslib_1.__assign({ autoComplete: "off" }, inputGroupHtmlProps, { intent: this.props.intent, inputRef: this.inputRef, large: this.props.large, leftIcon: this.props.leftIcon, onFocus: this.handleInputFocus, onBlur: this.handleInputBlur, onChange: this.handleInputChange, onKeyDown: this.handleInputKeyDown, onKeyPress: this.handleInputKeyPress, onPaste: this.handleInputPaste, rightElement: this.props.rightElement, value: this.state.value })));
    };
    // Callbacks - Buttons
    // ===================
    NumericInput.prototype.getButtonEventHandlers = function (direction) {
        var _this = this;
        return {
            // keydown is fired repeatedly when held so it's implicitly continuous
            onKeyDown: function (evt) {
                if (Keys.isKeyboardClick(evt.keyCode)) {
                    _this.handleButtonClick(evt, direction);
                }
            },
            onMouseDown: function (evt) {
                _this.handleButtonClick(evt, direction);
                _this.startContinuousChange();
            },
        };
    };
    NumericInput.prototype.startContinuousChange = function () {
        var _this = this;
        // The button's onMouseUp event handler doesn't fire if the user
        // releases outside of the button, so we need to watch all the way
        // from the top.
        document.addEventListener("mouseup", this.stopContinuousChange);
        // Initial delay is slightly longer to prevent the user from
        // accidentally triggering the continuous increment/decrement.
        this.setTimeout(function () {
            _this.intervalId = window.setInterval(_this.handleContinuousChange, NumericInput.CONTINUOUS_CHANGE_INTERVAL);
        }, NumericInput.CONTINUOUS_CHANGE_DELAY);
    };
    NumericInput.prototype.invokeValueCallback = function (value, callback) {
        Utils.safeInvoke(callback, +value, value);
    };
    // Value Helpers
    // =============
    NumericInput.prototype.incrementValue = function (delta) {
        // pretend we're incrementing from 0 if currValue is empty
        var currValue = this.state.value || NumericInput.VALUE_ZERO;
        var nextValue = this.getSanitizedValue(currValue, delta);
        this.setState({ shouldSelectAfterUpdate: this.props.selectAllOnIncrement, value: nextValue });
        this.invokeValueCallback(nextValue, this.props.onValueChange);
        return nextValue;
    };
    NumericInput.prototype.getIncrementDelta = function (direction, isShiftKeyPressed, isAltKeyPressed) {
        var _a = this.props, majorStepSize = _a.majorStepSize, minorStepSize = _a.minorStepSize, stepSize = _a.stepSize;
        if (isShiftKeyPressed && majorStepSize != null) {
            return direction * majorStepSize;
        }
        else if (isAltKeyPressed && minorStepSize != null) {
            return direction * minorStepSize;
        }
        else {
            return direction * stepSize;
        }
    };
    NumericInput.prototype.getSanitizedValue = function (value, delta, min, max) {
        if (delta === void 0) { delta = 0; }
        if (min === void 0) { min = this.props.min; }
        if (max === void 0) { max = this.props.max; }
        if (!isValueNumeric(value)) {
            return NumericInput.VALUE_EMPTY;
        }
        var nextValue = toMaxPrecision(parseFloat(value) + delta, this.state.stepMaxPrecision);
        return clampValue(nextValue, min, max).toString();
    };
    NumericInput.prototype.getStepMaxPrecision = function (props) {
        if (props.minorStepSize != null) {
            return Utils.countDecimalPlaces(props.minorStepSize);
        }
        else {
            return Utils.countDecimalPlaces(props.stepSize);
        }
    };
    NumericInput.prototype.updateDelta = function (direction, e) {
        this.delta = this.getIncrementDelta(direction, e.shiftKey, e.altKey);
        return this.delta;
    };
    NumericInput.displayName = DISPLAYNAME_PREFIX + ".NumericInput";
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
    return NumericInput;
}(AbstractPureComponent));
export { NumericInput };
//# sourceMappingURL=numericInput.js.map