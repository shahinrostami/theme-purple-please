"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var classnames_1 = tslib_1.__importDefault(require("classnames"));
var React = tslib_1.__importStar(require("react"));
var common_1 = require("../../common");
var index_1 = require("../../index");
var html_1 = require("../html/html");
var Callout = /** @class */ (function (_super) {
    tslib_1.__extends(Callout, _super);
    function Callout() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Callout.prototype.render = function () {
        var _a = this.props, className = _a.className, children = _a.children, icon = _a.icon, intent = _a.intent, title = _a.title, htmlProps = tslib_1.__rest(_a, ["className", "children", "icon", "intent", "title"]);
        var iconName = this.getIconName(icon, intent);
        var classes = classnames_1.default(common_1.Classes.CALLOUT, common_1.Classes.intentClass(intent), (_b = {}, _b[common_1.Classes.CALLOUT_ICON] = iconName != null, _b), className);
        return (React.createElement("div", tslib_1.__assign({ className: classes }, htmlProps),
            iconName && React.createElement(index_1.Icon, { icon: iconName, iconSize: index_1.Icon.SIZE_LARGE }),
            title && React.createElement(html_1.H4, null, title),
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
            case common_1.Intent.DANGER:
                return "error";
            case common_1.Intent.PRIMARY:
                return "info-sign";
            case common_1.Intent.WARNING:
                return "warning-sign";
            case common_1.Intent.SUCCESS:
                return "tick";
            default:
                return undefined;
        }
    };
    Callout.displayName = common_1.DISPLAYNAME_PREFIX + ".Callout";
    return Callout;
}(React.PureComponent));
exports.Callout = Callout;
//# sourceMappingURL=callout.js.map