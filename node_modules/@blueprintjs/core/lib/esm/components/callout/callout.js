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
import { Classes, DISPLAYNAME_PREFIX, Intent } from "../../common";
import { Icon } from "../../index";
import { H4 } from "../html/html";
var Callout = /** @class */ (function (_super) {
    tslib_1.__extends(Callout, _super);
    function Callout() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Callout.prototype.render = function () {
        var _a = this.props, className = _a.className, children = _a.children, icon = _a.icon, intent = _a.intent, title = _a.title, htmlProps = tslib_1.__rest(_a, ["className", "children", "icon", "intent", "title"]);
        var iconName = this.getIconName(icon, intent);
        var classes = classNames(Classes.CALLOUT, Classes.intentClass(intent), (_b = {}, _b[Classes.CALLOUT_ICON] = iconName != null, _b), className);
        return (React.createElement("div", tslib_1.__assign({ className: classes }, htmlProps),
            iconName && React.createElement(Icon, { icon: iconName, iconSize: Icon.SIZE_LARGE }),
            title && React.createElement(H4, null, title),
            children));
        var _b;
    };
    Callout.prototype.getIconName = function (icon, intent) {
        // 1. no icon
        if (icon === null) {
            return undefined;
        }
        // 2. defined iconName prop
        if (icon !== undefined) {
            return icon;
        }
        // 3. default intent icon
        switch (intent) {
            case Intent.DANGER:
                return "error";
            case Intent.PRIMARY:
                return "info-sign";
            case Intent.WARNING:
                return "warning-sign";
            case Intent.SUCCESS:
                return "tick";
            default:
                return undefined;
        }
    };
    Callout.displayName = DISPLAYNAME_PREFIX + ".Callout";
    return Callout;
}(React.PureComponent));
export { Callout };
//# sourceMappingURL=callout.js.map