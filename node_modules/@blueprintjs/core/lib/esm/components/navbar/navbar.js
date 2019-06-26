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
import { NavbarDivider } from "./navbarDivider";
import { NavbarGroup } from "./navbarGroup";
import { NavbarHeading } from "./navbarHeading";
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var Navbar = /** @class */ (function (_super) {
    tslib_1.__extends(Navbar, _super);
    function Navbar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Navbar.prototype.render = function () {
        var _a = this.props, children = _a.children, className = _a.className, fixedToTop = _a.fixedToTop, htmlProps = tslib_1.__rest(_a, ["children", "className", "fixedToTop"]);
        var classes = classNames(Classes.NAVBAR, (_b = {}, _b[Classes.FIXED_TOP] = fixedToTop, _b), className);
        return (React.createElement("div", tslib_1.__assign({ className: classes }, htmlProps), children));
        var _b;
    };
    Navbar.displayName = DISPLAYNAME_PREFIX + ".Navbar";
    Navbar.Divider = NavbarDivider;
    Navbar.Group = NavbarGroup;
    Navbar.Heading = NavbarHeading;
    return Navbar;
}(React.PureComponent));
export { Navbar };
//# sourceMappingURL=navbar.js.map