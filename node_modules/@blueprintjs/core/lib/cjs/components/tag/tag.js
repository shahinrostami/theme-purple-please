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
var classnames_1 = tslib_1.__importDefault(require("classnames"));
var React = tslib_1.__importStar(require("react"));
var common_1 = require("../../common");
var utils_1 = require("../../common/utils");
var icon_1 = require("../icon/icon");
var text_1 = require("../text/text");
var Tag = /** @class */ (function (_super) {
    tslib_1.__extends(Tag, _super);
    function Tag() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onRemoveClick = function (e) {
            common_1.Utils.safeInvoke(_this.props.onRemove, e, _this.props);
        };
        return _this;
    }
    Tag.prototype.render = function () {
        var _a = this.props, active = _a.active, children = _a.children, className = _a.className, fill = _a.fill, icon = _a.icon, intent = _a.intent, interactive = _a.interactive, large = _a.large, minimal = _a.minimal, multiline = _a.multiline, onRemove = _a.onRemove, rightIcon = _a.rightIcon, round = _a.round, _b = _a.tabIndex, tabIndex = _b === void 0 ? 0 : _b, htmlProps = tslib_1.__rest(_a, ["active", "children", "className", "fill", "icon", "intent", "interactive", "large", "minimal", "multiline", "onRemove", "rightIcon", "round", "tabIndex"]);
        var isRemovable = common_1.Utils.isFunction(onRemove);
        var tagClasses = classnames_1.default(common_1.Classes.TAG, common_1.Classes.intentClass(intent), (_c = {},
            _c[common_1.Classes.ACTIVE] = active,
            _c[common_1.Classes.FILL] = fill,
            _c[common_1.Classes.INTERACTIVE] = interactive,
            _c[common_1.Classes.LARGE] = large,
            _c[common_1.Classes.MINIMAL] = minimal,
            _c[common_1.Classes.ROUND] = round,
            _c), className);
        var isLarge = large || tagClasses.indexOf(common_1.Classes.LARGE) >= 0;
        var removeButton = isRemovable ? (React.createElement("button", { type: "button", className: common_1.Classes.TAG_REMOVE, onClick: this.onRemoveClick },
            React.createElement(icon_1.Icon, { icon: "small-cross", iconSize: isLarge ? icon_1.Icon.SIZE_LARGE : icon_1.Icon.SIZE_STANDARD }))) : null;
        return (React.createElement("span", tslib_1.__assign({}, htmlProps, { className: tagClasses, tabIndex: interactive ? tabIndex : undefined }),
            React.createElement(icon_1.Icon, { icon: icon }),
            !utils_1.isReactNodeEmpty(children) && (React.createElement(text_1.Text, { className: common_1.Classes.FILL, ellipsize: !multiline, tagName: "span" }, children)),
            React.createElement(icon_1.Icon, { icon: rightIcon }),
            removeButton));
        var _c;
    };
    Tag.displayName = common_1.DISPLAYNAME_PREFIX + ".Tag";
    return Tag;
}(React.PureComponent));
exports.Tag = Tag;
//# sourceMappingURL=tag.js.map