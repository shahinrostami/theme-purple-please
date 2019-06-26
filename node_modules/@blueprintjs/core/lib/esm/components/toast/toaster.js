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
import { TOASTER_CREATE_NULL, TOASTER_WARN_INLINE } from "../../common/errors";
import { ESCAPE } from "../../common/keys";
import { Position } from "../../common/position";
import { DISPLAYNAME_PREFIX } from "../../common/props";
import { isNodeEnv, safeInvoke } from "../../common/utils";
import { Overlay } from "../overlay/overlay";
import { Toast } from "./toast";
var Toaster = /** @class */ (function (_super) {
    tslib_1.__extends(Toaster, _super);
    function Toaster() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            toasts: [],
        };
        // auto-incrementing identifier for un-keyed toasts
        _this.toastId = 0;
        _this.getDismissHandler = function (toast) { return function (timeoutExpired) {
            _this.dismiss(toast.key, timeoutExpired);
        }; };
        _this.handleClose = function (e) {
            // NOTE that `e` isn't always a KeyboardEvent but that's the only type we care about
            if (e.which === ESCAPE) {
                _this.clear();
            }
        };
        return _this;
    }
    /**
     * Create a new `Toaster` instance that can be shared around your application.
     * The `Toaster` will be rendered into a new element appended to the given container.
     */
    Toaster.create = function (props, container) {
        if (container === void 0) { container = document.body; }
        if (props != null && props.usePortal != null && !isNodeEnv("production")) {
            console.warn(TOASTER_WARN_INLINE);
        }
        var containerElement = document.createElement("div");
        container.appendChild(containerElement);
        var toaster = ReactDOM.render(React.createElement(Toaster, tslib_1.__assign({}, props, { usePortal: false })), containerElement);
        if (toaster == null) {
            throw new Error(TOASTER_CREATE_NULL);
        }
        return toaster;
    };
    Toaster.prototype.show = function (props, key) {
        var options = this.createToastOptions(props, key);
        if (key === undefined || this.isNewToastKey(key)) {
            this.setState(function (prevState) { return ({
                toasts: [options].concat(prevState.toasts),
            }); });
        }
        else {
            this.setState(function (prevState) { return ({
                toasts: prevState.toasts.map(function (t) { return (t.key === key ? options : t); }),
            }); });
        }
        return options.key;
    };
    Toaster.prototype.dismiss = function (key, timeoutExpired) {
        if (timeoutExpired === void 0) { timeoutExpired = false; }
        this.setState(function (_a) {
            var toasts = _a.toasts;
            return ({
                toasts: toasts.filter(function (t) {
                    var matchesKey = t.key === key;
                    if (matchesKey) {
                        safeInvoke(t.onDismiss, timeoutExpired);
                    }
                    return !matchesKey;
                }),
            });
        });
    };
    Toaster.prototype.clear = function () {
        this.state.toasts.map(function (t) { return safeInvoke(t.onDismiss, false); });
        this.setState({ toasts: [] });
    };
    Toaster.prototype.getToasts = function () {
        return this.state.toasts;
    };
    Toaster.prototype.render = function () {
        // $pt-transition-duration * 3 + $pt-transition-duration / 2
        var classes = classNames(Classes.TOAST_CONTAINER, this.getPositionClasses(), this.props.className);
        return (React.createElement(Overlay, { autoFocus: this.props.autoFocus, canEscapeKeyClose: this.props.canEscapeKeyClear, canOutsideClickClose: false, className: classes, enforceFocus: false, hasBackdrop: false, isOpen: this.state.toasts.length > 0 || this.props.children != null, onClose: this.handleClose, transitionDuration: 350, transitionName: Classes.TOAST, usePortal: this.props.usePortal },
            this.state.toasts.map(this.renderToast, this),
            this.props.children));
    };
    Toaster.prototype.isNewToastKey = function (key) {
        return this.state.toasts.every(function (toast) { return toast.key !== key; });
    };
    Toaster.prototype.renderToast = function (toast) {
        return React.createElement(Toast, tslib_1.__assign({}, toast, { onDismiss: this.getDismissHandler(toast) }));
    };
    Toaster.prototype.createToastOptions = function (props, key) {
        if (key === void 0) { key = "toast-" + this.toastId++; }
        // clone the object before adding the key prop to avoid leaking the mutation
        return tslib_1.__assign({}, props, { key: key });
    };
    Toaster.prototype.getPositionClasses = function () {
        var positions = this.props.position.split("-");
        // NOTE that there is no -center class because that's the default style
        return positions.map(function (p) { return Classes.TOAST_CONTAINER + "-" + p.toLowerCase(); });
    };
    Toaster.displayName = DISPLAYNAME_PREFIX + ".Toaster";
    Toaster.defaultProps = {
        autoFocus: false,
        canEscapeKeyClear: true,
        position: Position.TOP,
        usePortal: true,
    };
    return Toaster;
}(AbstractPureComponent));
export { Toaster };
//# sourceMappingURL=toaster.js.map