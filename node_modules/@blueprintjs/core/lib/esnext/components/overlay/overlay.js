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
import classNames from "classnames";
import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { findDOMNode } from "react-dom";
import * as Classes from "../../common/classes";
import * as Keys from "../../common/keys";
import { DISPLAYNAME_PREFIX } from "../../common/props";
import { safeInvoke } from "../../common/utils";
import { Portal } from "../portal/portal";
export class Overlay extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
        this.refHandlers = {
            container: (ref) => (this.containerElement = findDOMNode(ref)),
        };
        this.maybeRenderChild = (child) => {
            if (child == null) {
                return null;
            }
            // add a special class to each child element that will automatically set the appropriate
            // CSS position mode under the hood. also, make the container focusable so we can
            // trap focus inside it (via `enforceFocus`).
            const decoratedChild = typeof child === "object" ? (React.cloneElement(child, {
                className: classNames(child.props.className, Classes.OVERLAY_CONTENT),
                tabIndex: 0,
            })) : (React.createElement("span", { className: Classes.OVERLAY_CONTENT }, child));
            const { onOpening, onOpened, onClosing, onClosed, transitionDuration, transitionName } = this.props;
            return (React.createElement(CSSTransition, { classNames: transitionName, onEntering: onOpening, onEntered: onOpened, onExiting: onClosing, onExited: onClosed, timeout: transitionDuration }, decoratedChild));
        };
        this.handleBackdropMouseDown = (e) => {
            const { backdropProps, canOutsideClickClose, enforceFocus, onClose } = this.props;
            if (canOutsideClickClose) {
                safeInvoke(onClose, e);
            }
            if (enforceFocus) {
                // make sure document.activeElement is updated before bringing the focus back
                this.bringFocusInsideOverlay();
            }
            safeInvoke(backdropProps.onMouseDown, e);
        };
        this.handleDocumentClick = (e) => {
            const { canOutsideClickClose, isOpen, onClose } = this.props;
            const eventTarget = e.target;
            const stackIndex = Overlay.openStack.indexOf(this);
            const isClickInThisOverlayOrDescendant = Overlay.openStack
                .slice(stackIndex)
                .some(({ containerElement: elem }) => {
                // `elem` is the container of backdrop & content, so clicking on that container
                // should not count as being "inside" the overlay.
                return elem && elem.contains(eventTarget) && !elem.isSameNode(eventTarget);
            });
            if (isOpen && canOutsideClickClose && !isClickInThisOverlayOrDescendant) {
                // casting to any because this is a native event
                safeInvoke(onClose, e);
            }
        };
        this.handleDocumentFocus = (e) => {
            if (this.props.enforceFocus &&
                this.containerElement != null &&
                !this.containerElement.contains(e.target)) {
                // prevent default focus behavior (sometimes auto-scrolls the page)
                e.preventDefault();
                e.stopImmediatePropagation();
                this.bringFocusInsideOverlay();
            }
        };
        this.handleKeyDown = (e) => {
            const { canEscapeKeyClose, onClose } = this.props;
            if (e.which === Keys.ESCAPE && canEscapeKeyClose) {
                safeInvoke(onClose, e);
                // prevent browser-specific escape key behavior (Safari exits fullscreen)
                e.preventDefault();
            }
        };
        this.state = { hasEverOpened: props.isOpen };
    }
    render() {
        // oh snap! no reason to render anything at all if we're being truly lazy
        if (this.props.lazy && !this.state.hasEverOpened) {
            return null;
        }
        const { children, className, usePortal, isOpen } = this.props;
        // TransitionGroup types require single array of children; does not support nested arrays.
        // So we must collapse backdrop and children into one array, and every item must be wrapped in a
        // Transition element (no ReactText allowed).
        const childrenWithTransitions = isOpen ? React.Children.map(children, this.maybeRenderChild) : [];
        childrenWithTransitions.unshift(this.maybeRenderBackdrop());
        const containerClasses = classNames(Classes.OVERLAY, {
            [Classes.OVERLAY_OPEN]: isOpen,
            [Classes.OVERLAY_INLINE]: !usePortal,
        }, className);
        const transitionGroup = (React.createElement(TransitionGroup, { appear: true, className: containerClasses, component: "div", onKeyDown: this.handleKeyDown, ref: this.refHandlers.container }, childrenWithTransitions));
        if (usePortal) {
            return (React.createElement(Portal, { className: this.props.portalClassName, container: this.props.portalContainer }, transitionGroup));
        }
        else {
            return transitionGroup;
        }
    }
    componentDidMount() {
        if (this.props.isOpen) {
            this.overlayWillOpen();
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ hasEverOpened: this.state.hasEverOpened || nextProps.isOpen });
    }
    componentDidUpdate(prevProps) {
        if (prevProps.isOpen && !this.props.isOpen) {
            this.overlayWillClose();
        }
        else if (!prevProps.isOpen && this.props.isOpen) {
            this.overlayWillOpen();
        }
    }
    componentWillUnmount() {
        this.overlayWillClose();
    }
    /**
     * @public for testing
     * @internal
     */
    bringFocusInsideOverlay() {
        // always delay focus manipulation to just before repaint to prevent scroll jumping
        return requestAnimationFrame(() => {
            // container ref may be undefined between component mounting and Portal rendering
            // activeElement may be undefined in some rare cases in IE
            if (this.containerElement == null || document.activeElement == null || !this.props.isOpen) {
                return;
            }
            const isFocusOutsideModal = !this.containerElement.contains(document.activeElement);
            if (isFocusOutsideModal) {
                // element marked autofocus has higher priority than the other clowns
                const autofocusElement = this.containerElement.querySelector("[autofocus]");
                const wrapperElement = this.containerElement.querySelector("[tabindex]");
                if (autofocusElement != null) {
                    autofocusElement.focus();
                }
                else if (wrapperElement != null) {
                    wrapperElement.focus();
                }
            }
        });
    }
    maybeRenderBackdrop() {
        const { backdropClassName, backdropProps, hasBackdrop, isOpen, transitionDuration, transitionName, } = this.props;
        if (hasBackdrop && isOpen) {
            return (React.createElement(CSSTransition, { classNames: transitionName, key: "__backdrop", timeout: transitionDuration },
                React.createElement("div", Object.assign({}, backdropProps, { className: classNames(Classes.OVERLAY_BACKDROP, backdropClassName, backdropProps.className), onMouseDown: this.handleBackdropMouseDown, tabIndex: this.props.canOutsideClickClose ? 0 : null }))));
        }
        else {
            return null;
        }
    }
    overlayWillClose() {
        document.removeEventListener("focus", this.handleDocumentFocus, /* useCapture */ true);
        document.removeEventListener("mousedown", this.handleDocumentClick);
        const { openStack } = Overlay;
        const stackIndex = openStack.indexOf(this);
        if (stackIndex !== -1) {
            openStack.splice(stackIndex, 1);
            if (openStack.length > 0) {
                const lastOpenedOverlay = Overlay.getLastOpened();
                if (lastOpenedOverlay.props.enforceFocus) {
                    document.addEventListener("focus", lastOpenedOverlay.handleDocumentFocus, /* useCapture */ true);
                }
            }
            if (openStack.filter(o => o.props.usePortal && o.props.hasBackdrop).length === 0) {
                document.body.classList.remove(Classes.OVERLAY_OPEN);
            }
        }
    }
    overlayWillOpen() {
        const { openStack } = Overlay;
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
    }
}
Overlay.displayName = `${DISPLAYNAME_PREFIX}.Overlay`;
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
Overlay.getLastOpened = () => Overlay.openStack[Overlay.openStack.length - 1];
//# sourceMappingURL=overlay.js.map