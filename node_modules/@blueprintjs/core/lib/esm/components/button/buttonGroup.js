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
import * as Classes from "../../common/classes";
import { DISPLAYNAME_PREFIX } from "../../common/props";
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var ButtonGroup = /** @class */ (function (_super) {
    tslib_1.__extends(ButtonGroup, _super);
    function ButtonGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonGroup.prototype.render = function () {
        var _a = this.props, alignText = _a.alignText, className = _a.className, fill = _a.fill, minimal = _a.minimal, large = _a.large, vertical = _a.vertical, htmlProps = tslib_1.__rest(_a, ["alignText", "className", "fill", "minimal", "large", "vertical"]);
        var buttonGroupClasses = classNames(Classes.BUTTON_GROUP, (_b = {},
            _b[Classes.FILL] = fill,
            _b[Classes.LARGE] = large,
            _b[Classes.MINIMAL] = minimal,
            _b[Classes.VERTICAL] = vertical,
            _b), Classes.alignmentClass(alignText), className);
        return (React.createElement("div", tslib_1.__assign({}, htmlProps, { className: buttonGroupClasses }), this.props.children));
        var _b;
    };
    ButtonGroup.displayName = DISPLAYNAME_PREFIX + ".ButtonGroup";
    return ButtonGroup;
}(React.PureComponent));
export { ButtonGroup };
//# sourceMappingURL=buttonGroup.js.map