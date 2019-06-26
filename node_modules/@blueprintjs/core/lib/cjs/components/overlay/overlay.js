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
var react_transition_group_1 = require("react-transition-group");
var react_dom_1 = require("react-dom");
var Classes = tslib_1.__importStar(require("../../common/classes"));
var Keys = tslib_1.__importStar(require("../../common/keys"));
var props_1 = require("../../common/props");
var utils_1 = require("../../common/utils");
var portal_1 = require("../portal/portal");
var Overlay = /** @class */ (function (_super) {
    tslib_1.__extends(Overlay, _super);
    function Overlay(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.refHandlers = {
            container: function (ref) { return (_this.containerElement = react_dom_1.findDOMNode(ref)); },
        };
        _this.maybeRenderChild = function (child) {
            if (child == null) {
                return null;
            }
            // add a special class to each child element that will automatically set the appropriate
            // CSS position mode under the hood. also, make the container focusable so we can
            // trap focus inside it (via `enforceFocus`).
            var decoratedChild = typeof child === "object" ? (React.cloneElement(child, {
                className: classnames_1.default(child.props.className, Classes.OVERLAY_CONTENT),
                tabIndex: 0,
            })) : (React.createElement("span", { className: Classes.OVERLAY_CONTENT }, child));
            var _a = _this.props, onOpening = _a.onOpening, onOpened = _a.onOpened, onClosing = _a.onClosing, onClosed = _a.onClosed, transitionDuration = _a.transitionDuration, transitionName = _a.transitionName;
            return (React.createElement(react_transition_group_1.CSSTransition, { classNames: transitionName, onEntering: onOpening, onEntered: onOpened, onExiting: onClosing, onExited: onClosed, timeout: transitionDuration }, decoratedChild));
        };
        _this.handleBackdropMouseDown = function (e) {
            var _a = _this.props, backdropProps = _a.backdropProps, canOutsideClickClose = _a.canOutsideClickClose, enforceFocus = _a.enforceFocus, onClose = _a.onClose;
            if (canOutsideClickClose) {
                utils_1.safeInvoke(onClose, e);
            }
            if (enforceFocus) {
                // make sure document.activeElement is updated before bringing the focus back
                _this.bringFocusInsideOverlay();
            }
            utils_1.safeInvoke(backdropProps.onMouseDown, e);
        };
        _this.handleDocumentClick = function (e) {
            var _a = _this.props, canOutsideClickClose = _a.canOutsideClickClose, isOpen = _a.isOpen, onClose = _a.onClose;
            var eventTarget = e.target;
            var stackIndex = Overlay.openStack.indexOf(_this);
            var isClickInThisOverlayOrDescendant = Overlay.openStack
                .slice(stackIndex)
                .some(function (_a) {
                var elem = _a.containerElement;
                // `elem` is the container of backdrop & content, so clicking on that container
                // should not count as being "inside" the overlay.
                return elem && elem.contains(eventTarget) && !elem.isSameNode(eventTarget);
            });
            if (isOpen && canOutsideClickClose && !isClickInThisOverlayOrDescendant) {
                // casting to any because this is a native event
                utils_1.safeInvoke(onClose, e);
            }
        };
        _this.handleDocumentFocus = function (e) {
            if (_this.props.enforceFocus &&
                _this.containerElement != null &&
                !_this.containerElement.contains(e.target)) {
                // prevent default focus behavior (sometimes auto-scrolls the page)
                e.preventDefault();
                e.stopImmediatePropagation();
                _this.bringFocusInsideOverlay();
            }
        };
        _this.handleKeyDown = function (e) {
            var _a = _this.props, canEscapeKeyClose = _a.canEscapeKeyClose, onClose = _a.onClose;
            if (e.which === Keys.ESCAPE && canEscapeKeyClose) {
                utils_1.safeInvoke(onClose, e);
                // prevent browser-specific escape key behavior (Safari exits fullscreen)
                e.preventDefault();
            }
        };
        _this.state = { hasEverOpened: props.isOpen };
        return _this;
    }
    Overlay.prototype.render = function () {
        // oh snap! no reason to render anything at all if we're being truly lazy
        if (this.props.lazy && !this.state.hasEverOpened) {
            return null;
        }
        var _a = this.props, children = _a.children, className = _a.className, usePortal = _a.usePortal, isOpen = _a.isOpen;
        // TransitionGroup types require single array of children; does not support nested arrays.
        // So we must collapse backdrop and children into one array, and every item must be wrapped in a
        // Transition element (no ReactText allowed).
        var childrenWithTransitions = isOpen ? React.Children.map(children, this.maybeRenderChild) : [];
        childrenWithTransitions.unshift(this.maybeRenderBackdrop());
        var containerClasses = classnames_1.default(Classes.OVERLAY, (_b = {},
            _b[Classes.OVERLAY_OPEN] = isOpen,
            _b[Classes.OVERLAY_INLINE] = !usePortal,
            _b), className);
        var transitionGroup = (React.createElement(react_transition_group_1.TransitionGroup, { appear: true, className: containerClasses, component: "div", onKeyDown: this.handleKeyDown, ref: this.refHandlers.container }, childrenWithTransitions));
        if (usePortal) {
            return (React.createElement(portal_1.Portal, { className: this.props.portalClassName, container: this.props.portalContainer }, transitionGroup));
        }
        else {
            return transitionGroup;
        }
        var _b;
    };
    Overlay.prototype.componentDidMount = function () {
        if (this.props.isOpen) {
            this.overlayWillOpen();
        }
    };
    Overlay.prototype.componentWillReceiveProps = function (nextProps) {
        this.setState({ hasEverOpened: this.state.hasEverOpened || nextProps.isOpen });
    };
    Overlay.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.isOpen && !this.props.isOpen) {
            this.overlayWillClose();
        }
        else if (!prevProps.isOpen && this.props.isOpen) {
            this.overlayWillOpen();
        }
    };
    Overlay.prototype.componentWillUnmount = function () {
        this.overlayWillClose();
    };
    /**
     * @public for testing
     * @internal
     */
    Overlay.prototype.bringFocusInsideOverlay = function () {
        var _this = this;
        // always delay focus manipulation to just before repaint to prevent scroll jumping
        return requestAnimationFrame(function () {
            // container ref may be undefined between component mounting and Portal rendering
            // activeElement may be undefined in some rare cases in IE
            if (_this.containerElement == null || document.activeElement == null || !_this.props.isOpen) {
                return;
            }
            var isFocusOutsideModal = !_this.containerElement.contains(document.activeElement);
            if (isFocusOutsideModal) {
                // element marked autofocus has higher priority than the other clowns
                var autofocusElement = _this.containerElement.querySelector("[autofocus]");
                var wrapperElement = _this.containerElement.querySelector("[tabindex]");
                if (autofocusElement != null) {
                    autofocusElement.focus();
                }
                else if (wrapperElement != null) {
                    wrapperElement.focus();
                }
            }
        });
    };
    Overlay.prototype.maybeRenderBackdrop = function () {
        var _a = this.props, backdropClassName = _a.backdropClassName, backdropProps = _a.backdropProps, hasBackdrop = _a.hasBackdrop, isOpen = _a.isOpen, transitionDuration = _a.transitionDuration, transitionName = _a.transitionName;
        if (hasBackdrop && isOpen) {
            return (React.createElement(react_transition_group_1.CSSTransition, { classNames: transitionName, key: "__backdrop", timeout: transitionDuration },
                React.createElement("div", tslib_1.__assign({}, backdropProps, { className: classnames_1.default(Classes.OVERLAY_BACKDROP, backdropClassName, backdropProps.className), onMouseDown: this.handleBackdropMouseDown, tabIndex: this.props.canOutsideClickClose ? 0 : null }))));
        }
        else {
            return null;
        }
    };
    Overlay.prototype.overlayWillClose = function () {
        document.removeEventListener("focus", this.handleDocumentFocus, /* useCapture */ true);
        document.removeEventListener("mousedown", this.handleDocumentClick);
        var openStack = Overlay.openStack;
        var stackIndex = openStack.indexOf(this);
        if (stackIndex !== -1) {
            openStack.splice(stackIndex, 1);
            if (openStack.length > 0) {
                var lastOpenedOverlay = Overlay.getLastOpened();
                if (lastOpenedOverlay.props.enforceFocus) {
                    document.addEventListener("focus", lastOpenedOverlay.handleDocumentFocus, /* useCapture */ true);
                }
            }
            if (openStack.filter(function (o) { return o.props.usePortal && o.props.hasBackdrop; }).length === 0) {
                document.body.classList.remove(Classes.OVERLAY_OPEN);
            }
        }
    };
    Overlay.prototype.overlayWillOpen = function () {
        var openStack = Overlay.openStack;
        if (openStack.length > 0) {
            document.removeEventListener("focus", Overlay.getLastOpened().handleDocumentFocus, /* useCapture */ true);
        }
        openStack.push(this);
        if (this.props.autoFocus) {
            this.bringFocusInsideOverlay();
        }
        if (this.props.enforceFocus) {
            document.addEventListener("focus", this.handleDocumentFocus, /* useCapture */ true);
        }
        if (this.props.canOutsideClickClose && !this.props.hasBackdrop) {
            document.addEventListener("mousedown", this.handleDocumentClick);
        }
        if (this.props.hasBackdrop && this.props.usePortal) {
            // add a class to the body to prevent scrolling of content below the overlay
            document.body.classList.add(Classes.OVERLAY_OPEN);
        }
    };
    Overlay.displayName = props_1.DISPLAYNAME_PREFIX + ".Overlay";
    Overlay.defaultProps = {
        autoFocus: true,
        backdropProps: {},
        canEscapeKeyClose: true,
        canOutsideClickClose: true,
        enforceFocus: true,
        hasBackdrop: true,
        isOpen: false,
        lazy: true,
        transitionDuration: 300,
        transitionName: Classes.OVERLAY,
        usePortal: true,
    };
    Overlay.openStack = [];
    Overlay.getLastOpened = function () { return Overlay.openStack[Overlay.openStack.length - 1]; };
    return Overlay;
}(React.PureComponent));
exports.Overlay = Overlay;
//# sourceMappingURL=overlay.js.map