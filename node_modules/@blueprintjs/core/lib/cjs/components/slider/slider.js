"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var abstractPureComponent_1 = require("../../common/abstractPureComponent");
var intent_1 = require("../../common/intent");
var props_1 = require("../../common/props");
var multiSlider_1 = require("./multiSlider");
var Slider = /** @class */ (function (_super) {
    tslib_1.__extends(Slider, _super);
    function Slider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Slider.prototype.render = function () {
        var _a = this.props, initialValue = _a.initialValue, value = _a.value, onChange = _a.onChange, onRelease = _a.onRelease, props = tslib_1.__rest(_a, ["initialValue", "value", "onChange", "onRelease"]);
        return (React.createElement(multiSlider_1.MultiSlider, tslib_1.__assign({}, props),
            React.createElement(multiSlider_1.MultiSlider.Handle, { value: value, intentAfter: value < initialValue ? intent_1.Intent.PRIMARY : undefined, intentBefore: value >= initialValue ? intent_1.Intent.PRIMARY : undefined, onChange: onChange, onRelease: onRelease }),
            React.createElement(multiSlider_1.MultiSlider.Handle, { value: initialValue, interactionKind: "none" })));
    };
    Slider.defaultProps = tslib_1.__assign({}, multiSlider_1.MultiSlider.defaultSliderProps, { initialValue: 0, value: 0 });
    Slider.displayName = props_1.DISPLAYNAME_PREFIX + ".Slider";
    return Slider;
}(abstractPureComponent_1.AbstractPureComponent));
exports.Slider = Slider;
//# sourceMappingURL=slider.js.map