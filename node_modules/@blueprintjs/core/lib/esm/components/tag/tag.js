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
import * as tslib_1 from "tslib";
import classNames from "classnames";
import * as React from "react";
import { Classes, DISPLAYNAME_PREFIX, Utils } from "../../common";
import { isReactNodeEmpty } from "../../common/utils";
import { Icon } from "../icon/icon";
import { Text } from "../text/text";
var Tag = /** @class */ (function (_super) {
    tslib_1.__extends(Tag, _super);
    function Tag() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onRemoveClick = function (e) {
            Utils.safeInvoke(_this.props.onRemove, e, _this.props);
        };
        return _this;
    }
    Tag.prototype.render = function () {
        var _a = this.props, active = _a.active, children = _a.children, className = _a.className, fill = _a.fill, icon = _a.icon, intent = _a.intent, interactive = _a.interactive, large = _a.large, minimal = _a.minimal, multiline = _a.multiline, onRemove = _a.onRemove, rightIcon = _a.rightIcon, round = _a.round, _b = _a.tabIndex, tabIndex = _b === void 0 ? 0 : _b, htmlProps = tslib_1.__rest(_a, ["active", "children", "className", "fill", "icon", "intent", "interactive", "large", "minimal", "multiline", "onRemove", "rightIcon", "round", "tabIndex"]);
        var isRemovable = Utils.isFunction(onRemove);
        var tagClasses = classNames(Classes.TAG, Classes.intentClass(intent), (_c = {},
            _c[Classes.ACTIVE] = active,
            _c[Classes.FILL] = fill,
            _c[Classes.INTERACTIVE] = interactive,
            _c[Classes.LARGE] = large,
            _c[Classes.MINIMAL] = minimal,
            _c[Classes.ROUND] = round,
            _c), className);
        var isLarge = large || tagClasses.indexOf(Classes.LARGE) >= 0;
        var removeButton = isRemovable ? (React.createElement("button", { type: "button", className: Classes.TAG_REMOVE, onClick: this.onRemoveClick },
            React.createElement(Icon, { icon: "small-cross", iconSize: isLarge ? Icon.SIZE_LARGE : Icon.SIZE_STANDARD }))) : null;
        return (React.createElement("span", tslib_1.__assign({}, htmlProps, { className: tagClasses, tabIndex: interactive ? tabIndex : undefined }),
            React.createElement(Icon, { icon: icon }),
            !isReactNodeEmpty(children) && (React.createElement(Text, { className: Classes.FILL, ellipsize: !multiline, tagName: "span" }, children)),
            React.createElement(Icon, { icon: rightIcon }),
            removeButton));
        var _c;
    };
    Tag.displayName = DISPLAYNAME_PREFIX + ".Tag";
    return Tag;
}(React.PureComponent));
export { Tag };
//# sourceMappingURL=tag.js.map