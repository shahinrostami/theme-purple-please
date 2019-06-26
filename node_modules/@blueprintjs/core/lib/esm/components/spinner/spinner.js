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
import { AbstractPureComponent } from "../../common/abstractPureComponent";
import * as Classes from "../../common/classes";
import { SPINNER_WARN_CLASSES_SIZE } from "../../common/errors";
import { DISPLAYNAME_PREFIX } from "../../common/props";
import { clamp } from "../../common/utils";
// see http://stackoverflow.com/a/18473154/3124288 for calculating arc path
var R = 45;
var SPINNER_TRACK = "M 50,50 m 0,-" + R + " a " + R + "," + R + " 0 1 1 0," + R * 2 + " a " + R + "," + R + " 0 1 1 0,-" + R * 2;
// unitless total length of SVG path, to which stroke-dash* properties are relative.
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pathLength
// this value is the result of `<path d={SPINNER_TRACK} />.getTotalLength()` and works in all browsers:
var PATH_LENGTH = 280;
var MIN_SIZE = 10;
var STROKE_WIDTH = 4;
var MIN_STROKE_WIDTH = 16;
var Spinner = /** @class */ (function (_super) {
    tslib_1.__extends(Spinner, _super);
    function Spinner() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Spinner.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.value !== this.props.value) {
            // IE/Edge: re-render after changing value to force SVG update
            this.forceUpdate();
        }
    };
    Spinner.prototype.render = function () {
        var _a = this.props, className = _a.className, intent = _a.intent, value = _a.value, _b = _a.tagName, TagName = _b === void 0 ? "div" : _b;
        var size = this.getSize();
        var classes = classNames(Classes.SPINNER, Classes.intentClass(intent), (_c = {}, _c[Classes.SPINNER_NO_SPIN] = value != null, _c), className);
        // keep spinner track width consistent at all sizes (down to about 10px).
        var strokeWidth = Math.min(MIN_STROKE_WIDTH, (STROKE_WIDTH * Spinner.SIZE_LARGE) / size);
        var strokeOffset = PATH_LENGTH - PATH_LENGTH * (value == null ? 0.25 : clamp(value, 0, 1));
        // multiple DOM elements around SVG are necessary to properly isolate animation:
        // - SVG elements in IE do not support anim/trans so they must be set on a parent HTML element.
        // - SPINNER_ANIMATION isolates svg from parent display and is always centered inside root element.
        return (React.createElement(TagName, { className: classes },
            React.createElement(TagName, { className: Classes.SPINNER_ANIMATION },
                React.createElement("svg", { width: size, height: size, strokeWidth: strokeWidth.toFixed(2), viewBox: this.getViewBox(strokeWidth) },
                    React.createElement("path", { className: Classes.SPINNER_TRACK, d: SPINNER_TRACK }),
                    React.createElement("path", { className: Classes.SPINNER_HEAD, d: SPINNER_TRACK, pathLength: PATH_LENGTH, strokeDasharray: PATH_LENGTH + " " + PATH_LENGTH, strokeDashoffset: strokeOffset })))));
        var _c;
    };
    Spinner.prototype.validateProps = function (_a) {
        var _b = _a.className, className = _b === void 0 ? "" : _b, size = _a.size;
        if (size != null && (className.indexOf(Classes.SMALL) >= 0 || className.indexOf(Classes.LARGE) >= 0)) {
            console.warn(SPINNER_WARN_CLASSES_SIZE);
        }
    };
    /**
     * Resolve size to a pixel value.
     * Size can be set by className, props, default, or minimum constant.
     */
    Spinner.prototype.getSize = function () {
        var _a = this.props, _b = _a.className, className = _b === void 0 ? "" : _b, size = _a.size;
        if (size == null) {
            // allow Classes constants to determine default size.
            if (className.indexOf(Classes.SMALL) >= 0) {
                return Spinner.SIZE_SMALL;
            }
            else if (className.indexOf(Classes.LARGE) >= 0) {
                return Spinner.SIZE_LARGE;
            }
            return Spinner.SIZE_STANDARD;
        }
        return Math.max(MIN_SIZE, size);
    };
    /** Compute viewbox such that stroked track sits exactly at edge of image frame. */
    Spinner.prototype.getViewBox = function (strokeWidth) {
        var radius = R + strokeWidth / 2;
        var viewBoxX = (50 - radius).toFixed(2);
        var viewBoxWidth = (radius * 2).toFixed(2);
        return viewBoxX + " " + viewBoxX + " " + viewBoxWidth + " " + viewBoxWidth;
    };
    Spinner.displayName = DISPLAYNAME_PREFIX + ".Spinner";
    Spinner.SIZE_SMALL = 20;
    Spinner.SIZE_STANDARD = 50;
    Spinner.SIZE_LARGE = 100;
    return Spinner;
}(AbstractPureComponent));
export { Spinner };
//# sourceMappingURL=spinner.js.map