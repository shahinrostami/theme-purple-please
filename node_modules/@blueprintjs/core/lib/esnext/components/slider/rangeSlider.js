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
import * as React from "react";
import { AbstractPureComponent } from "../../common/abstractPureComponent";
import * as Errors from "../../common/errors";
import { Intent } from "../../common/intent";
import { DISPLAYNAME_PREFIX } from "../../common/props";
import { MultiSlider } from "./multiSlider";
var RangeIndex;
(function (RangeIndex) {
    RangeIndex[RangeIndex["START"] = 0] = "START";
    RangeIndex[RangeIndex["END"] = 1] = "END";
})(RangeIndex || (RangeIndex = {}));
export class RangeSlider extends AbstractPureComponent {
    render() {
        const { value, ...props } = this.props;
        return (React.createElement(MultiSlider, Object.assign({}, props),
            React.createElement(MultiSlider.Handle, { value: value[RangeIndex.START], type: "start", intentAfter: Intent.PRIMARY }),
            React.createElement(MultiSlider.Handle, { value: value[RangeIndex.END], type: "end" })));
    }
    validateProps(props) {
        const { value } = props;
        if (value == null || value[RangeIndex.START] == null || value[RangeIndex.END] == null) {
            throw new Error(Errors.RANGESLIDER_NULL_VALUE);
        }
    }
}
RangeSlider.defaultProps = {
    ...MultiSlider.defaultSliderProps,
    value: [0, 10],
};
RangeSlider.displayName = `${DISPLAYNAME_PREFIX}.RangeSlider`;
//# sourceMappingURL=rangeSlider.js.map