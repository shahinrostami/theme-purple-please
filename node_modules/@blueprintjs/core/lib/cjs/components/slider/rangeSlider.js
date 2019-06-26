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
var Errors = tslib_1.__importStar(require("../../common/errors"));
var intent_1 = require("../../common/intent");
var props_1 = require("../../common/props");
var multiSlider_1 = require("./multiSlider");
var RangeIndex;
(function (RangeIndex) {
    RangeIndex[RangeIndex["START"] = 0] = "START";
    RangeIndex[RangeIndex["END"] = 1] = "END";
})(RangeIndex || (RangeIndex = {}));
var RangeSlider = /** @class */ (function (_super) {
    tslib_1.__extends(RangeSlider, _super);
    function RangeSlider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RangeSlider.prototype.render = function () {
        var _a = this.props, value = _a.value, props = tslib_1.__rest(_a, ["value"]);
        return (React.createElement(multiSlider_1.MultiSlider, tslib_1.__assign({}, props),
            React.createElement(multiSlider_1.MultiSlider.Handle, { value: value[RangeIndex.START], type: "start", intentAfter: intent_1.Intent.PRIMARY }),
            React.createElement(multiSlider_1.MultiSlider.Handle, { value: value[RangeIndex.END], type: "end" })));
    };
    RangeSlider.prototype.validateProps = function (props) {
        var value = props.value;
        if (value == null || value[RangeIndex.START] == null || value[RangeIndex.END] == null) {
            throw new Error(Errors.RANGESLIDER_NULL_VALUE);
        }
    };
    RangeSlider.defaultProps = tslib_1.__assign({}, multiSlider_1.MultiSlider.defaultSliderProps, { value: [0, 10] });
    RangeSlider.displayName = props_1.DISPLAYNAME_PREFIX + ".RangeSlider";
    return RangeSlider;
}(abstractPureComponent_1.AbstractPureComponent));
exports.RangeSlider = RangeSlider;
//# sourceMappingURL=rangeSlider.js.map