/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
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
import { AbstractPureComponent } from "../../common/abstractPureComponent";
import * as Classes from "../../common/classes";
import * as Errors from "../../common/errors";
import { getPositionIgnoreAngles, isPositionHorizontal } from "../../common/position";
import { DISPLAYNAME_PREFIX } from "../../common/props";
import { Button } from "../button/buttons";
import { H4 } from "../html/html";
import { Icon } from "../icon/icon";
import { Overlay } from "../overlay/overlay";
var Drawer = /** @class */ (function (_super) {
    tslib_1.__extends(Drawer, _super);
    function Drawer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Drawer.prototype.render = function () {
        var _a = this.props, size = _a.size, style = _a.style, position = _a.position, vertical = _a.vertical;
        var realPosition = position ? getPositionIgnoreAngles(position) : null;
        var classes = classNames(Classes.DRAWER, (_b = {},
            _b[Classes.VERTICAL] = !realPosition && vertical,
            _b[realPosition ? Classes.positionClass(realPosition) : ""] = true,
            _b), this.props.className);
        var styleProp = size == null
            ? style
            : tslib_1.__assign({}, style, (_c = {}, _c[(realPosition ? isPositionHorizontal(realPosition) : vertical) ? "height" : "width"] = size, _c));
        return (React.createElement(Overlay, tslib_1.__assign({}, this.props, { className: Classes.OVERLAY_CONTAINER }),
            React.createElement("div", { className: classes, style: styleProp },
                this.maybeRenderHeader(),
                this.props.children)));
        var _b, _c;
    };
    Drawer.prototype.validateProps = function (props) {
        if (props.title == null) {
            if (props.icon != null) {
                console.warn(Errors.DIALOG_WARN_NO_HEADER_ICON);
            }
            if (props.isCloseButtonShown != null) {
                console.warn(Errors.DIALOG_WARN_NO_HEADER_CLOSE_BUTTON);
            }
        }
        if (props.position != null) {
            if (props.vertical) {
                console.warn(Errors.DRAWER_VERTICAL_IS_IGNORED);
            }
            if (props.position !== getPositionIgnoreAngles(props.position)) {
                console.warn(Errors.DRAWER_ANGLE_POSITIONS_ARE_CASTED);
            }
        }
    };
    Drawer.prototype.maybeRenderCloseButton = function () {
        // `isCloseButtonShown` can't be defaulted through default props because of props validation
        // so this check actually defaults it to true (fails only if directly set to false)
        if (this.props.isCloseButtonShown !== false) {
            return (React.createElement(Button, { "aria-label": "Close", className: Classes.DIALOG_CLOSE_BUTTON, icon: React.createElement(Icon, { icon: "small-cross", iconSize: Icon.SIZE_LARGE }), minimal: true, onClick: this.props.onClose }));
        }
        else {
            return null;
        }
    };
    Drawer.prototype.maybeRenderHeader = function () {
        var _a = this.props, icon = _a.icon, title = _a.title;
        if (title == null) {
            return null;
        }
        return (React.createElement("div", { className: Classes.DRAWER_HEADER },
            React.createElement(Icon, { icon: icon, iconSize: Icon.SIZE_LARGE }),
            React.createElement(H4, null, title),
            this.maybeRenderCloseButton()));
    };
    Drawer.displayName = DISPLAYNAME_PREFIX + ".Drawer";
    Drawer.defaultProps = {
        canOutsideClickClose: true,
        isOpen: false,
        position: null,
        style: {},
        vertical: false,
    };
    Drawer.SIZE_SMALL = "360px";
    Drawer.SIZE_STANDARD = "50%";
    Drawer.SIZE_LARGE = "90%";
    return Drawer;
}(AbstractPureComponent));
export { Drawer };
//# sourceMappingURL=drawer.js.map