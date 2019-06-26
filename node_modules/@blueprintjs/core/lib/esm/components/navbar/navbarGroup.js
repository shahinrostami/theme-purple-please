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
import { Alignment } from "../../common/alignment";
import * as Classes from "../../common/classes";
import { DISPLAYNAME_PREFIX } from "../../common/props";
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var NavbarGroup = /** @class */ (function (_super) {
    tslib_1.__extends(NavbarGroup, _super);
    function NavbarGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NavbarGroup.prototype.render = function () {
        var _a = this.props, align = _a.align, children = _a.children, className = _a.className, htmlProps = tslib_1.__rest(_a, ["align", "children", "className"]);
        var classes = classNames(Classes.NAVBAR_GROUP, Classes.alignmentClass(align), className);
        return (React.createElement("div", tslib_1.__assign({ className: classes }, htmlProps), children));
    };
    NavbarGroup.displayName = DISPLAYNAME_PREFIX + ".NavbarGroup";
    NavbarGroup.defaultProps = {
        align: Alignment.LEFT,
    };
    return NavbarGroup;
}(React.PureComponent));
export { NavbarGroup };
//# sourceMappingURL=navbarGroup.js.map