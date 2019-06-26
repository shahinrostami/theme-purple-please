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
import * as ReactDOM from "react-dom";
import { AbstractPureComponent } from "../../common/abstractPureComponent";
import * as Classes from "../../common/classes";
import { Position } from "../../common/position";
import { safeInvoke } from "../../common/utils";
import { Popover } from "../popover/popover";
var POPPER_MODIFIERS = {
    preventOverflow: { boundariesElement: "viewport" },
};
var TRANSITION_DURATION = 100;
/* istanbul ignore next */
var ContextMenu = /** @class */ (function (_super) {
    tslib_1.__extends(ContextMenu, _super);
    function ContextMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isDarkTheme: false,
            isOpen: false,
            menu: null,
            offset: null,
        };
        _this.cancelContextMenu = function (e) { return e.preventDefault(); };
        _this.handleBackdropContextMenu = function (e) {
            // React function to remove from the event pool, useful when using a event within a callback
            e.persist();
            e.preventDefault();
            // wait for backdrop to disappear so we can find the "real" element at event coordinates.
            // timeout duration is equivalent to transition duration so we know it's animated out.
            _this.setTimeout(function () {
                // retrigger context menu event at the element beneath the backdrop.
                // if it has a `contextmenu` event handler then it'll be invoked.
                // if it doesn't, no native menu will show (at least on OSX) :(
                var newTarget = document.elementFromPoint(e.clientX, e.clientY);
                newTarget.dispatchEvent(new MouseEvent("contextmenu", e));
            }, TRANSITION_DURATION);
        };
        _this.handlePopoverInteraction = function (nextOpenState) {
            if (!nextOpenState) {
                // delay the actual hiding till the event queue clears
                // to avoid flicker of opening twice
                requestAnimationFrame(function () { return _this.hide(); });
            }
        };
        return _this;
    }
    ContextMenu.prototype.render = function () {
        // prevent right-clicking in a context menu
        var content = React.createElement("div", { onContextMenu: this.cancelContextMenu }, this.state.menu);
        var popoverClassName = classNames((_a = {}, _a[Classes.DARK] = this.state.isDarkTheme, _a));
        // HACKHACK: workaround until we have access to Popper#scheduleUpdate().
        // https://github.com/palantir/blueprint/issues/692
        // Generate key based on offset so a new Popover instance is created
        // when offset changes, to force recomputing position.
        var key = this.state.offset == null ? "" : this.state.offset.left + "x" + this.state.offset.top;
        // wrap the popover in a positioned div to make sure it is properly
        // offset on the screen.
        return (React.createElement("div", { className: Classes.CONTEXT_MENU_POPOVER_TARGET, style: this.state.offset },
            React.createElement(Popover, tslib_1.__assign({}, this.props, { backdropProps: { onContextMenu: this.handleBackdropContextMenu }, content: content, enforceFocus: false, key: key, hasBackdrop: true, isOpen: this.state.isOpen, minimal: true, modifiers: POPPER_MODIFIERS, onInteraction: this.handlePopoverInteraction, position: Position.RIGHT_TOP, popoverClassName: popoverClassName, target: React.createElement("div", null), transitionDuration: TRANSITION_DURATION }))));
        var _a;
    };
    ContextMenu.prototype.show = function (menu, offset, onClose, isDarkTheme) {
        this.setState({ isOpen: true, menu: menu, offset: offset, onClose: onClose, isDarkTheme: isDarkTheme });
    };
    ContextMenu.prototype.hide = function () {
        safeInvoke(this.state.onClose);
        this.setState({ isOpen: false, onClose: undefined });
    };
    return ContextMenu;
}(AbstractPureComponent));
var contextMenuElement;
var contextMenu;
/**
 * Show the given menu element at the given offset from the top-left corner of the viewport.
 * The menu will appear below-right of this point and will flip to below-left if there is not enough
 * room onscreen. The optional callback will be invoked when this menu closes.
 */
export function show(menu, offset, onClose, isDarkTheme) {
    if (contextMenuElement == null) {
        contextMenuElement = document.createElement("div");
        contextMenuElement.classList.add(Classes.CONTEXT_MENU);
        document.body.appendChild(contextMenuElement);
        contextMenu = ReactDOM.render(React.createElement(ContextMenu, { onClosed: remove }), contextMenuElement);
    }
    contextMenu.show(menu, offset, onClose, isDarkTheme);
}
/** Hide the open context menu. */
export function hide() {
    if (contextMenu != null) {
        contextMenu.hide();
    }
}
/** Return whether a context menu is currently open. */
export function isOpen() {
    return contextMenu != null && contextMenu.state.isOpen;
}
function remove() {
    if (contextMenuElement != null) {
        ReactDOM.unmountComponentAtNode(contextMenuElement);
        contextMenuElement.remove();
        contextMenuElement = null;
        contextMenu = null;
    }
}
//# sourceMappingURL=contextMenu.js.map