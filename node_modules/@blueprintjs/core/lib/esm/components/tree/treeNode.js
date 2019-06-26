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
import { safeInvoke } from "../../common/utils";
import { Collapse } from "../collapse/collapse";
import { Icon } from "../icon/icon";
var TreeNode = /** @class */ (function (_super) {
    tslib_1.__extends(TreeNode, _super);
    function TreeNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleCaretClick = function (e) {
            e.stopPropagation();
            var _a = _this.props, isExpanded = _a.isExpanded, onCollapse = _a.onCollapse, onExpand = _a.onExpand;
            safeInvoke(isExpanded ? onCollapse : onExpand, _this, e);
        };
        _this.handleClick = function (e) {
            safeInvoke(_this.props.onClick, _this, e);
        };
        _this.handleContentRef = function (element) {
            safeInvoke(_this.props.contentRef, _this, element);
        };
        _this.handleContextMenu = function (e) {
            safeInvoke(_this.props.onContextMenu, _this, e);
        };
        _this.handleDoubleClick = function (e) {
            safeInvoke(_this.props.onDoubleClick, _this, e);
        };
        _this.handleMouseEnter = function (e) {
            safeInvoke(_this.props.onMouseEnter, _this, e);
        };
        _this.handleMouseLeave = function (e) {
            safeInvoke(_this.props.onMouseLeave, _this, e);
        };
        return _this;
    }
    TreeNode.ofType = function () {
        return TreeNode;
    };
    TreeNode.prototype.render = function () {
        var _a = this.props, children = _a.children, className = _a.className, disabled = _a.disabled, icon = _a.icon, isExpanded = _a.isExpanded, isSelected = _a.isSelected, label = _a.label;
        var classes = classNames(Classes.TREE_NODE, (_b = {},
            _b[Classes.DISABLED] = disabled,
            _b[Classes.TREE_NODE_SELECTED] = isSelected,
            _b[Classes.TREE_NODE_EXPANDED] = isExpanded,
            _b), className);
        var contentClasses = classNames(Classes.TREE_NODE_CONTENT, Classes.TREE_NODE_CONTENT + "-" + this.props.depth);
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
                React.createElement(Icon, { className: Classes.TREE_NODE_ICON, icon: icon }),
                React.createElement("span", { className: Classes.TREE_NODE_LABEL }, label),
                this.maybeRenderSecondaryLabel()),
            React.createElement(Collapse, { isOpen: isExpanded }, children)));
        var _b;
    };
    TreeNode.prototype.maybeRenderCaret = function () {
        var _a = this.props, children = _a.children, isExpanded = _a.isExpanded, disabled = _a.disabled, _b = _a.hasCaret, hasCaret = _b === void 0 ? React.Children.count(children) > 0 : _b;
        if (hasCaret) {
            var caretClasses = classNames(Classes.TREE_NODE_CARET, isExpanded ? Classes.TREE_NODE_CARET_OPEN : Classes.TREE_NODE_CARET_CLOSED);
            var onClick = disabled === true ? undefined : this.handleCaretClick;
            return React.createElement(Icon, { className: caretClasses, onClick: onClick, icon: "chevron-right" });
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
    TreeNode.displayName = DISPLAYNAME_PREFIX + ".TreeNode";
    return TreeNode;
}(React.Component));
export { TreeNode };
//# sourceMappingURL=treeNode.js.map