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
import * as Classes from "../../common/classes";
import { DISPLAYNAME_PREFIX } from "../../common/props";
import { MenuDivider } from "./menuDivider";
import { MenuItem } from "./menuItem";
var Menu = /** @class */ (function (_super) {
    tslib_1.__extends(Menu, _super);
    function Menu() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Menu.prototype.render = function () {
        var _a = this.props, className = _a.className, children = _a.children, large = _a.large, ulRef = _a.ulRef, htmlProps = tslib_1.__rest(_a, ["className", "children", "large", "ulRef"]);
        var classes = classNames(Classes.MENU, (_b = {}, _b[Classes.LARGE] = large, _b), className);
        return (React.createElement("ul", tslib_1.__assign({}, htmlProps, { className: classes, ref: ulRef }), children));
        var _b;
    };
    Menu.displayName = DISPLAYNAME_PREFIX + ".Menu";
    Menu.Divider = MenuDivider;
    Menu.Item = MenuItem;
    return Menu;
}(React.Component));
export { Menu };
//# sourceMappingURL=menu.js.map