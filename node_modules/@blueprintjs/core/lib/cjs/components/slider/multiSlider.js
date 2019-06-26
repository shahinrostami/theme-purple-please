"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var classnames_1 = tslib_1.__importDefault(require("classnames"));
var React = tslib_1.__importStar(require("react"));
var common_1 = require("../../common");
var abstractPureComponent_1 = require("../../common/abstractPureComponent");
var Errors = tslib_1.__importStar(require("../../common/errors"));
var props_1 = require("../../common/props");
var Utils = tslib_1.__importStar(require("../../common/utils"));
var handle_1 = require("./handle");
var handleProps_1 = require("./handleProps");
var sliderUtils_1 = require("./sliderUtils");
/**
 * SFC used to pass slider handle props to a `MultiSlider`.
 * This element is not rendered directly.
 */
var MultiSliderHandle = function () { return null; };
MultiSliderHandle.displayName = props_1.DISPLAYNAME_PREFIX + ".MultiSliderHandle";
var MultiSlider = /** @class */ (function (_super) {
    tslib_1.__extends(MultiSlider, _super);
    function MultiSlider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            labelPrecision: getLabelPrecision(_this.props),
            tickSize: 0,
            tickSizeRatio: 0,
        };
        _this.handleElements = [];
        _this.addHandleRef = function (ref) {
            if (ref != null) {
                _this.handleElements.push(ref);
            }
        };
        _this.maybeHandleTrackClick = function (event) {
            if (_this.canHandleTrackEvent(event)) {
                var foundHandle = _this.nearestHandleForValue(_this.handleElements, function (handle) {
                    return handle.mouseEventClientOffset(event);
                });
                if (foundHandle) {
                    foundHandle.beginHandleMovement(event);
                }
            }
        };
        _this.maybeHandleTrackTouch = function (event) {
            if (_this.canHandleTrackEvent(event)) {
                var foundHandle = _this.nearestHandleForValue(_this.handleElements, function (handle) {
                    return handle.touchEventClientOffset(event);
                });
                if (foundHandle) {
                    foundHandle.beginHandleTouchMovement(event);
                }
            }
        };
        _this.canHandleTrackEvent = function (event) {
            var target = event.target;
            // ensure event does not come from inside the handle
            return !_this.props.disabled && target.closest("." + common_1.Classes.SLIDER_HANDLE) == null;
        };
        _this.getHandlerForIndex = function (index, callback) {
            return function (newValue) {
                Utils.safeInvoke(callback, _this.getNewHandleValues(newValue, index));
            };
        };
        _this.handleChange = function (newValues) {
            var oldValues = _this.handleProps.map(function (handle) { return handle.value; });
            if (!Utils.arraysEqual(newValues, oldValues)) {
                Utils.safeInvoke(_this.props.onChange, newValues);
                _this.handleProps.forEach(function (handle, index) {
                    if (oldValues[index] !== newValues[index]) {
                        Utils.safeInvoke(handle.onChange, newValues[index]);
                    }
                });
            }
        };
        _this.handleRelease = function (newValues) {
            Utils.safeInvoke(_this.props.onRelease, newValues);
            _this.handleProps.forEach(function (handle, index) {
                Utils.safeInvoke(handle.onRelease, newValues[index]);
            });
        };
        return _this;
    }
    MultiSlider.prototype.render = function () {
        var _this = this;
        var classes = classnames_1.default(common_1.Classes.SLIDER, (_a = {},
            _a[common_1.Classes.DISABLED] = this.props.disabled,
            _a[common_1.Classes.SLIDER + "-unlabeled"] = this.props.labelRenderer === false,
            _a[common_1.Classes.VERTICAL] = this.props.vertical,
            _a), this.props.className);
        return (React.createElement("div", { className: classes, onMouseDown: this.maybeHandleTrackClick, onTouchStart: this.maybeHandleTrackTouch },
            React.createElement("div", { className: common_1.Classes.SLIDER_TRACK, ref: function (ref) { return (_this.trackElement = ref); } }, this.renderTracks()),
            React.createElement("div", { className: common_1.Classes.SLIDER_AXIS }, this.renderLabels()),
            this.renderHandles()));
        var _a;
    };
    MultiSlider.prototype.componentWillMount = function () {
        this.handleProps = getSortedInteractiveHandleProps(this.props);
    };
    MultiSlider.prototype.componentDidMount = function () {
        this.updateTickSize();
    };
    MultiSlider.prototype.componentDidUpdate = function () {
        this.updateTickSize();
    };
    MultiSlider.prototype.componentWillReceiveProps = function (nextProps) {
        this.setState({ labelPrecision: this.getLabelPrecision(nextProps) });
        var newHandleProps = getSortedInteractiveHandleProps(nextProps);
        if (newHandleProps.length !== this.handleProps.length) {
            this.handleElements = [];
        }
        this.handleProps = newHandleProps;
    };
    MultiSlider.prototype.validateProps = function (props) {
        if (props.stepSize <= 0) {
            throw new Error(Errors.SLIDER_ZERO_STEP);
        }
        if (props.labelStepSize <= 0) {
            throw new Error(Errors.SLIDER_ZERO_LABEL_STEP);
        }
        var anyInvalidChildren = false;
        React.Children.forEach(props.children, function (child) {
            // allow boolean coercion to omit nulls and false values
            if (child && !Utils.isElementOfType(child, MultiSlider.Handle)) {
                anyInvalidChildren = true;
            }
        });
        if (anyInvalidChildren) {
            throw new Error(Errors.MULTISLIDER_INVALID_CHILD);
        }
    };
    MultiSlider.prototype.formatLabel = function (value) {
        var labelRenderer = this.props.labelRenderer;
        if (labelRenderer === false) {
            return null;
        }
        else if (Utils.isFunction(labelRenderer)) {
            return labelRenderer(value);
        }
        else {
            return value.toFixed(this.state.labelPrecision);
        }
    };
    MultiSlider.prototype.renderLabels = function () {
        if (this.props.labelRenderer === false) {
            return null;
        }
        var _a = this.props, labelStepSize = _a.labelStepSize, max = _a.max, min = _a.min;
        var labels = [];
        var stepSizeRatio = this.state.tickSizeRatio * labelStepSize;
        // step size lends itself naturally to a `for` loop
        // tslint:disable-next-line:one-variable-per-declaration ban-comma-operator
        for (var i = min, offsetRatio = 0; i < max || Utils.approxEqual(i, max); i += labelStepSize, offsetRatio += stepSizeRatio) {
            var offsetPercentage = sliderUtils_1.formatPercentage(offsetRatio);
            var style = this.props.vertical ? { bottom: offsetPercentage } : { left: offsetPercentage };
            labels.push(React.createElement("div", { className: common_1.Classes.SLIDER_LABEL, key: i, style: style }, this.formatLabel(i)));
        }
        return labels;
    };
    MultiSlider.prototype.renderTracks = function () {
        var trackStops = getSortedHandleProps(this.props);
        trackStops.push({ value: this.props.max });
        // render from current to previous, then increment previous
        var previous = { value: this.props.min };
        var handles = [];
        for (var index = 0; index < trackStops.length; index++) {
            var current = trackStops[index];
            handles.push(this.renderTrackFill(index, previous, current));
            previous = current;
        }
        return handles;
    };
    MultiSlider.prototype.renderTrackFill = function (index, start, end) {
        // ensure startRatio <= endRatio
        var _a = [this.getOffsetRatio(start.value), this.getOffsetRatio(end.value)].sort(), startRatio = _a[0], endRatio = _a[1];
        var startOffset = sliderUtils_1.formatPercentage(startRatio);
        var endOffset = sliderUtils_1.formatPercentage(1 - endRatio);
        var style = this.props.vertical
            ? { bottom: startOffset, top: endOffset, left: 0 }
            : { left: startOffset, right: endOffset, top: 0 };
        var classes = classnames_1.default(common_1.Classes.SLIDER_PROGRESS, common_1.Classes.intentClass(this.getTrackIntent(start, end)));
        return React.createElement("div", { key: "track-" + index, className: classes, style: style });
    };
    MultiSlider.prototype.renderHandles = function () {
        var _this = this;
        var _a = this.props, disabled = _a.disabled, max = _a.max, min = _a.min, stepSize = _a.stepSize, vertical = _a.vertical;
        return this.handleProps.map(function (_a, index) {
            var value = _a.value, type = _a.type;
            return (React.createElement(handle_1.Handle, { className: classnames_1.default((_b = {},
                    _b[common_1.Classes.START] = type === handleProps_1.HandleType.START,
                    _b[common_1.Classes.END] = type === handleProps_1.HandleType.END,
                    _b)), disabled: disabled, key: index + "-" + _this.handleProps.length, label: _this.formatLabel(value), max: max, min: min, onChange: _this.getHandlerForIndex(index, _this.handleChange), onRelease: _this.getHandlerForIndex(index, _this.handleRelease), ref: _this.addHandleRef, stepSize: stepSize, tickSize: _this.state.tickSize, tickSizeRatio: _this.state.tickSizeRatio, value: value, vertical: vertical }));
            var _b;
        });
    };
    MultiSlider.prototype.nearestHandleForValue = function (handles, getOffset) {
        return sliderUtils_1.argMin(handles, function (handle) {
            var offset = getOffset(handle);
            var offsetValue = handle.clientToValue(offset);
            var handleValue = handle.props.value;
            return Math.abs(offsetValue - handleValue);
        });
    };
    MultiSlider.prototype.getNewHandleValues = function (newValue, oldIndex) {
        var oldValues = this.handleProps.map(function (handle) { return handle.value; });
        var newValues = oldValues.slice();
        newValues[oldIndex] = newValue;
        newValues.sort(function (left, right) { return left - right; });
        var newIndex = newValues.indexOf(newValue);
        var lockIndex = this.findFirstLockedHandleIndex(oldIndex, newIndex);
        if (lockIndex === -1) {
            sliderUtils_1.fillValues(newValues, oldIndex, newIndex, newValue);
        }
        else {
            // If pushing past a locked handle, discard the new value and only make the updates to clamp values against the lock.
            var lockValue = oldValues[lockIndex];
            sliderUtils_1.fillValues(oldValues, oldIndex, lockIndex, lockValue);
            return oldValues;
        }
        return newValues;
    };
    MultiSlider.prototype.findFirstLockedHandleIndex = function (startIndex, endIndex) {
        var inc = startIndex < endIndex ? 1 : -1;
        for (var index = startIndex + inc; index !== endIndex + inc; index += inc) {
            if (this.handleProps[index].interactionKind !== handleProps_1.HandleInteractionKind.PUSH) {
                return index;
            }
        }
        return -1;
    };
    MultiSlider.prototype.getLabelPrecision = function (_a) {
        var labelPrecision = _a.labelPrecision, stepSize = _a.stepSize;
        // infer default label precision from stepSize because that's how much the handle moves.
        return labelPrecision == null ? Utils.countDecimalPlaces(stepSize) : labelPrecision;
    };
    MultiSlider.prototype.getOffsetRatio = function (value) {
        return Utils.clamp((value - this.props.min) * this.state.tickSizeRatio, 0, 1);
    };
    MultiSlider.prototype.getTrackIntent = function (start, end) {
        if (!this.props.showTrackFill) {
            return common_1.Intent.NONE;
        }
        if (start.intentAfter !== undefined) {
            return start.intentAfter;
        }
        else if (end !== undefined && end.intentBefore !== undefined) {
            return end.intentBefore;
        }
        return this.props.defaultTrackIntent;
    };
    MultiSlider.prototype.updateTickSize = function () {
        if (this.trackElement != null) {
            var trackSize = this.props.vertical ? this.trackElement.clientHeight : this.trackElement.clientWidth;
            var tickSizeRatio = 1 / (this.props.max - this.props.min);
            var tickSize = trackSize * tickSizeRatio;
            this.setState({ tickSize: tickSize, tickSizeRatio: tickSizeRatio });
        }
    };
    MultiSlider.defaultSliderProps = {
        disabled: false,
        labelStepSize: 1,
        max: 10,
        min: 0,
        showTrackFill: true,
        stepSize: 1,
        vertical: false,
    };
    MultiSlider.defaultProps = tslib_1.__assign({}, MultiSlider.defaultSliderProps, { defaultTrackIntent: common_1.Intent.NONE });
    MultiSlider.displayName = props_1.DISPLAYNAME_PREFIX + ".MultiSlider";
    MultiSlider.Handle = MultiSliderHandle;
    return MultiSlider;
}(abstractPureComponent_1.AbstractPureComponent));
exports.MultiSlider = MultiSlider;
function getLabelPrecision(_a) {
    var labelPrecision = _a.labelPrecision, stepSize = _a.stepSize;
    // infer default label precision from stepSize because that's how much the handle moves.
    return labelPrecision == null ? Utils.countDecimalPlaces(stepSize) : labelPrecision;
}
function getSortedInteractiveHandleProps(props) {
    return getSortedHandleProps(props, function (childProps) { return childProps.interactionKind !== handleProps_1.HandleInteractionKind.NONE; });
}
function getSortedHandleProps(_a, predicate) {
    var children = _a.children;
    if (predicate === void 0) { predicate = function () { return true; }; }
    var maybeHandles = React.Children.map(children, function (child) {
        return Utils.isElementOfType(child, MultiSlider.Handle) && predicate(child.props) ? child.props : null;
    });
    var handles = maybeHandles != null ? maybeHandles : [];
    handles = handles.filter(function (handle) { return handle !== null; });
    handles.sort(function (left, right) { return left.value - right.value; });
    return handles;
}
//# sourceMappingURL=multiSlider.js.map