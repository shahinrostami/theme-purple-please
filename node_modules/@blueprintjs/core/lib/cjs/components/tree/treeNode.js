"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var classnames_1 = tslib_1.__importDefault(require("classnames"));
var React = tslib_1.__importStar(require("react"));
var Classes = tslib_1.__importStar(require("../../common/classes"));
var props_1 = require("../../common/props");
var utils_1 = require("../../common/utils");
var collapse_1 = require("../collapse/collapse");
var icon_1 = require("../icon/icon");
var TreeNode = /** @class */ (function (_super) {
    tslib_1.__extends(TreeNode, _super);
    function TreeNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleCaretClick = function (e) {
            e.stopPropagation();
            var _a = _this.props, isExpanded = _a.isExpanded, onCollapse = _a.onCollapse, onExpand = _a.onExpand;
            utils_1.safeInvoke(isExpanded ? onCollapse : onExpand, _this, e);
        };
        _this.handleClick = function (e) {
            utils_1.safeInvoke(_this.props.onClick, _this, e);
        };
        _this.handleContentRef = function (element) {
            utils_1.safeInvoke(_this.props.contentRef, _this, element);
        };
        _this.handleContextMenu = function (e) {
            utils_1.safeInvoke(_this.props.onContextMenu, _this, e);
        };
        _this.handleDoubleClick = function (e) {
            utils_1.safeInvoke(_this.props.onDoubleClick, _this, e);
        };
        _this.handleMouseEnter = function (e) {
            utils_1.safeInvoke(_this.props.onMouseEnter, _this, e);
        };
        _this.handleMouseLeave = function (e) {
            utils_1.safeInvoke(_this.props.onMouseLeave, _this, e);
        };
        return _this;
    }
    TreeNode.ofType = function () {
        return TreeNode;
    };
    TreeNode.prototype.render = function () {
        var _a = this.props, children = _a.children, className = _a.className, disabled = _a.disabled, icon = _a.icon, isExpanded = _a.isExpanded, isSelected = _a.isSelected, label = _a.label;
        var classes = classnames_1.default(Classes.TREE_NODE, (_b = {},
            _b[Classes.DISABLED] = disabled,
            _b[Classes.TREE_NODE_SELECTED] = isSelected,
            _b[Classes.TREE_NODE_EXPANDED] = isExpanded,
            _b), className);
        var contentClasses = classnames_1.default(Classes.TREE_NODE_CONTENT, Classes.TREE_NODE_CONTENT + "-" + this.props.depth);
        var eventHandlers = disabled === true
            ? {}
            : {
                onClick: this.handleClick,
                onContextMenu: this.handleContextMenu,
                onDoubleClick: this.handleDoubleClick,
                onMouseEnter: this.handleMouseEnter,
                onMouseLeave: this.handleMouseLeave,
            };
        return (React.createElement("li", { className: classes },
            React.createElement("div", tslib_1.__assign({ className: contentClasses, ref: this.handleContentRef }, eventHandlers),
                this.maybeRenderCaret(),
                React.createElement(icon_1.Icon, { className: Classes.TREE_NODE_ICON, icon: icon }),
                React.createElement("span", { className: Classes.TREE_NODE_LABEL }, label),
                this.maybeRenderSecondaryLabel()),
            React.createElement(collapse_1.Collapse, { isOpen: isExpanded }, children)));
        var _b;
    };
    TreeNode.prototype.maybeRenderCaret = function () {
        var _a = this.props, children = _a.children, isExpanded = _a.isExpanded, disabled = _a.disabled, _b = _a.hasCaret, hasCaret = _b === void 0 ? React.Children.count(children) > 0 : _b;
        if (hasCaret) {
            var caretClasses = classnames_1.default(Classes.TREE_NODE_CARET, isExpanded ? Classes.TREE_NODE_CARET_OPEN : Classes.TREE_NODE_CARET_CLOSED);
            var onClick = disabled === true ? undefined : this.handleCaretClick;
            return React.createElement(icon_1.Icon, { className: caretClasses, onClick: onClick, icon: "chevron-right" });
        }
        return React.createElement("span", { className: Classes.TREE_NODE_CARET_NONE });
    };
    TreeNode.prototype.maybeRenderSecondaryLabel = function () {
        if (this.props.secondaryLabel != null) {
            return React.createElement("span", { className: Classes.TREE_NODE_SECONDARY_LABEL }, this.props.secondaryLabel);
        }
        else {
            return undefined;
        }
    };
    TreeNode.displayName = props_1.DISPLAYNAME_PREFIX + ".TreeNode";
    return TreeNode;
}(React.Component));
exports.TreeNode = TreeNode;
//# sourceMappingURL=treeNode.js.map