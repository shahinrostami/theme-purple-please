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
import classNames from "classnames";
import * as React from "react";
import { Classes, Intent } from "../../common";
import { AbstractPureComponent } from "../../common/abstractPureComponent";
import * as Errors from "../../common/errors";
import { DISPLAYNAME_PREFIX } from "../../common/props";
import * as Utils from "../../common/utils";
import { Handle } from "./handle";
import { HandleInteractionKind, HandleType } from "./handleProps";
import { argMin, fillValues, formatPercentage } from "./sliderUtils";
/**
 * SFC used to pass slider handle props to a `MultiSlider`.
 * This element is not rendered directly.
 */
const MultiSliderHandle = () => null;
MultiSliderHandle.displayName = `${DISPLAYNAME_PREFIX}.MultiSliderHandle`;
export class MultiSlider extends AbstractPureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            labelPrecision: getLabelPrecision(this.props),
            tickSize: 0,
            tickSizeRatio: 0,
        };
        this.handleElements = [];
        this.addHandleRef = (ref) => {
            if (ref != null) {
                this.handleElements.push(ref);
            }
        };
        this.maybeHandleTrackClick = (event) => {
            if (this.canHandleTrackEvent(event)) {
                const foundHandle = this.nearestHandleForValue(this.handleElements, handle => handle.mouseEventClientOffset(event));
                if (foundHandle) {
                    foundHandle.beginHandleMovement(event);
                }
            }
        };
        this.maybeHandleTrackTouch = (event) => {
            if (this.canHandleTrackEvent(event)) {
                const foundHandle = this.nearestHandleForValue(this.handleElements, handle => handle.touchEventClientOffset(event));
                if (foundHandle) {
                    foundHandle.beginHandleTouchMovement(event);
                }
            }
        };
        this.canHandleTrackEvent = (event) => {
            const target = event.target;
            // ensure event does not come from inside the handle
            return !this.props.disabled && target.closest(`.${Classes.SLIDER_HANDLE}`) == null;
        };
        this.getHandlerForIndex = (index, callback) => {
            return (newValue) => {
                Utils.safeInvoke(callback, this.getNewHandleValues(newValue, index));
            };
        };
        this.handleChange = (newValues) => {
            const oldValues = this.handleProps.map(handle => handle.value);
            if (!Utils.arraysEqual(newValues, oldValues)) {
                Utils.safeInvoke(this.props.onChange, newValues);
                this.handleProps.forEach((handle, index) => {
                    if (oldValues[index] !== newValues[index]) {
                        Utils.safeInvoke(handle.onChange, newValues[index]);
                    }
                });
            }
        };
        this.handleRelease = (newValues) => {
            Utils.safeInvoke(this.props.onRelease, newValues);
            this.handleProps.forEach((handle, index) => {
                Utils.safeInvoke(handle.onRelease, newValues[index]);
            });
        };
    }
    render() {
        const classes = classNames(Classes.SLIDER, {
            [Classes.DISABLED]: this.props.disabled,
            [`${Classes.SLIDER}-unlabeled`]: this.props.labelRenderer === false,
            [Classes.VERTICAL]: this.props.vertical,
        }, this.props.className);
        return (React.createElement("div", { className: classes, onMouseDown: this.maybeHandleTrackClick, onTouchStart: this.maybeHandleTrackTouch },
            React.createElement("div", { className: Classes.SLIDER_TRACK, ref: ref => (this.trackElement = ref) }, this.renderTracks()),
            React.createElement("div", { className: Classes.SLIDER_AXIS }, this.renderLabels()),
            this.renderHandles()));
    }
    componentWillMount() {
        this.handleProps = getSortedInteractiveHandleProps(this.props);
    }
    componentDidMount() {
        this.updateTickSize();
    }
    componentDidUpdate() {
        this.updateTickSize();
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ labelPrecision: this.getLabelPrecision(nextProps) });
        const newHandleProps = getSortedInteractiveHandleProps(nextProps);
        if (newHandleProps.length !== this.handleProps.length) {
            this.handleElements = [];
        }
        this.handleProps = newHandleProps;
    }
    validateProps(props) {
        if (props.stepSize <= 0) {
            throw new Error(Errors.SLIDER_ZERO_STEP);
        }
        if (props.labelStepSize <= 0) {
            throw new Error(Errors.SLIDER_ZERO_LABEL_STEP);
        }
        let anyInvalidChildren = false;
        React.Children.forEach(props.children, child => {
            // allow boolean coercion to omit nulls and false values
            if (child && !Utils.isElementOfType(child, MultiSlider.Handle)) {
                anyInvalidChildren = true;
            }
        });
        if (anyInvalidChildren) {
            throw new Error(Errors.MULTISLIDER_INVALID_CHILD);
        }
    }
    formatLabel(value) {
        const { labelRenderer } = this.props;
        if (labelRenderer === false) {
            return null;
        }
        else if (Utils.isFunction(labelRenderer)) {
            return labelRenderer(value);
        }
        else {
            return value.toFixed(this.state.labelPrecision);
        }
    }
    renderLabels() {
        if (this.props.labelRenderer === false) {
            return null;
        }
        const { labelStepSize, max, min } = this.props;
        const labels = [];
        const stepSizeRatio = this.state.tickSizeRatio * labelStepSize;
        // step size lends itself naturally to a `for` loop
        // tslint:disable-next-line:one-variable-per-declaration ban-comma-operator
        for (let i = min, offsetRatio = 0; i < max || Utils.approxEqual(i, max); i += labelStepSize, offsetRatio += stepSizeRatio) {
            const offsetPercentage = formatPercentage(offsetRatio);
            const style = this.props.vertical ? { bottom: offsetPercentage } : { left: offsetPercentage };
            labels.push(React.createElement("div", { className: Classes.SLIDER_LABEL, key: i, style: style }, this.formatLabel(i)));
        }
        return labels;
    }
    renderTracks() {
        const trackStops = getSortedHandleProps(this.props);
        trackStops.push({ value: this.props.max });
        // render from current to previous, then increment previous
        let previous = { value: this.props.min };
        const handles = [];
        for (let index = 0; index < trackStops.length; index++) {
            const current = trackStops[index];
            handles.push(this.renderTrackFill(index, previous, current));
            previous = current;
        }
        return handles;
    }
    renderTrackFill(index, start, end) {
        // ensure startRatio <= endRatio
        const [startRatio, endRatio] = [this.getOffsetRatio(start.value), this.getOffsetRatio(end.value)].sort();
        const startOffset = formatPercentage(startRatio);
        const endOffset = formatPercentage(1 - endRatio);
        const style = this.props.vertical
            ? { bottom: startOffset, top: endOffset, left: 0 }
            : { left: startOffset, right: endOffset, top: 0 };
        const classes = classNames(Classes.SLIDER_PROGRESS, Classes.intentClass(this.getTrackIntent(start, end)));
        return React.createElement("div", { key: `track-${index}`, className: classes, style: style });
    }
    renderHandles() {
        const { disabled, max, min, stepSize, vertical } = this.props;
        return this.handleProps.map(({ value, type }, index) => (React.createElement(Handle, { className: classNames({
                [Classes.START]: type === HandleType.START,
                [Classes.END]: type === HandleType.END,
            }), disabled: disabled, key: `${index}-${this.handleProps.length}`, label: this.formatLabel(value), max: max, min: min, onChange: this.getHandlerForIndex(index, this.handleChange), onRelease: this.getHandlerForIndex(index, this.handleRelease), ref: this.addHandleRef, stepSize: stepSize, tickSize: this.state.tickSize, tickSizeRatio: this.state.tickSizeRatio, value: value, vertical: vertical })));
    }
    nearestHandleForValue(handles, getOffset) {
        return argMin(handles, handle => {
            const offset = getOffset(handle);
            const offsetValue = handle.clientToValue(offset);
            const handleValue = handle.props.value;
            return Math.abs(offsetValue - handleValue);
        });
    }
    getNewHandleValues(newValue, oldIndex) {
        const oldValues = this.handleProps.map(handle => handle.value);
        const newValues = oldValues.slice();
        newValues[oldIndex] = newValue;
        newValues.sort((left, right) => left - right);
        const newIndex = newValues.indexOf(newValue);
        const lockIndex = this.findFirstLockedHandleIndex(oldIndex, newIndex);
        if (lockIndex === -1) {
            fillValues(newValues, oldIndex, newIndex, newValue);
        }
        else {
            // If pushing past a locked handle, discard the new value and only make the updates to clamp values against the lock.
            const lockValue = oldValues[lockIndex];
            fillValues(oldValues, oldIndex, lockIndex, lockValue);
            return oldValues;
        }
        return newValues;
    }
    findFirstLockedHandleIndex(startIndex, endIndex) {
        const inc = startIndex < endIndex ? 1 : -1;
        for (let index = startIndex + inc; index !== endIndex + inc; index += inc) {
            if (this.handleProps[index].interactionKind !== HandleInteractionKind.PUSH) {
                return index;
            }
        }
        return -1;
    }
    getLabelPrecision({ labelPrecision, stepSize }) {
        // infer default label precision from stepSize because that's how much the handle moves.
        return labelPrecision == null ? Utils.countDecimalPlaces(stepSize) : labelPrecision;
    }
    getOffsetRatio(value) {
        return Utils.clamp((value - this.props.min) * this.state.tickSizeRatio, 0, 1);
    }
    getTrackIntent(start, end) {
        if (!this.props.showTrackFill) {
            return Intent.NONE;
        }
        if (start.intentAfter !== undefined) {
            return start.intentAfter;
        }
        else if (end !== undefined && end.intentBefore !== undefined) {
            return end.intentBefore;
        }
        return this.props.defaultTrackIntent;
    }
    updateTickSize() {
        if (this.trackElement != null) {
            const trackSize = this.props.vertical ? this.trackElement.clientHeight : this.trackElement.clientWidth;
            const tickSizeRatio = 1 / (this.props.max - this.props.min);
            const tickSize = trackSize * tickSizeRatio;
            this.setState({ tickSize, tickSizeRatio });
        }
    }
}
MultiSlider.defaultSliderProps = {
    disabled: false,
    labelStepSize: 1,
    max: 10,
    min: 0,
    showTrackFill: true,
    stepSize: 1,
    vertical: false,
};
MultiSlider.defaultProps = {
    ...MultiSlider.defaultSliderProps,
    defaultTrackIntent: Intent.NONE,
};
MultiSlider.displayName = `${DISPLAYNAME_PREFIX}.MultiSlider`;
MultiSlider.Handle = MultiSliderHandle;
function getLabelPrecision({ labelPrecision, stepSize }) {
    // infer default label precision from stepSize because that's how much the handle moves.
    return labelPrecision == null ? Utils.countDecimalPlaces(stepSize) : labelPrecision;
}
function getSortedInteractiveHandleProps(props) {
    return getSortedHandleProps(props, childProps => childProps.interactionKind !== HandleInteractionKind.NONE);
}
function getSortedHandleProps({ children }, predicate = () => true) {
    const maybeHandles = React.Children.map(children, child => Utils.isElementOfType(child, MultiSlider.Handle) && predicate(child.props) ? child.props : null);
    let handles = maybeHandles != null ? maybeHandles : [];
    handles = handles.filter(handle => handle !== null);
    handles.sort((left, right) => left.value - right.value);
    return handles;
}
//# sourceMappingURL=multiSlider.js.map