/*
 * Copyright 2021 Palantir Technologies, Inc. All rights reserved.
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
import { __spreadArrays } from "tslib";
import classNames from "classnames";
import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Classes, DISPLAYNAME_PREFIX } from "../../common";
import { PanelView2 } from "./panelView2";
/**
 * @template T type union of all possible panels in this stack
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export var PanelStack2 = function (props) {
    var _a = props.renderActivePanelOnly, renderActivePanelOnly = _a === void 0 ? true : _a, _b = props.showPanelHeader, showPanelHeader = _b === void 0 ? true : _b, propsStack = props.stack;
    var _c = React.useState("push"), direction = _c[0], setDirection = _c[1];
    var _d = React.useState(props.initialPanel !== undefined ? [props.initialPanel] : []), localStack = _d[0], setLocalStack = _d[1];
    var stack = React.useMemo(function () { return (propsStack != null ? propsStack.slice().reverse() : localStack); }, [
        localStack,
        propsStack,
    ]);
    var stackLength = React.useRef(stack.length);
    React.useEffect(function () {
        if (stack.length !== stackLength.current) {
            // Adjust the direction in case the stack size has changed, controlled or uncontrolled
            setDirection(stack.length - stackLength.current < 0 ? "pop" : "push");
        }
        stackLength.current = stack.length;
    }, [stack]);
    var handlePanelOpen = React.useCallback(function (panel) {
        var _a;
        (_a = props.onOpen) === null || _a === void 0 ? void 0 : _a.call(props, panel);
        if (props.stack == null) {
            setLocalStack(function (prevStack) { return __spreadArrays([panel], prevStack); });
        }
    }, [props.onOpen]);
    var handlePanelClose = React.useCallback(function (panel) {
        var _a;
        // only remove this panel if it is at the top and not the only one.
        if (stack[0] !== panel || stack.length <= 1) {
            return;
        }
        (_a = props.onClose) === null || _a === void 0 ? void 0 : _a.call(props, panel);
        if (props.stack == null) {
            setLocalStack(function (prevStack) { return prevStack.slice(1); });
        }
    }, [stack, props.onClose]);
    // early return, after all hooks are called
    if (stack.length === 0) {
        return null;
    }
    var panelsToRender = renderActivePanelOnly ? [stack[0]] : stack;
    var panels = panelsToRender
        .map(function (panel, index) {
        // With renderActivePanelOnly={false} we would keep all the CSSTransitions rendered,
        // therefore they would not trigger the "enter" transition event as they were entered.
        // To force the enter event, we want to change the key, but stack.length is not enough
        // and a single panel should not rerender as long as it's hidden.
        // This key contains two parts: first one, stack.length - index is constant (and unique) for each panel,
        // second one, active changes only when the panel becomes or stops being active.
        var layer = stack.length - index;
        var key = renderActivePanelOnly ? stack.length : layer;
        return (React.createElement(CSSTransition, { classNames: Classes.PANEL_STACK2, key: key, timeout: 400 },
            React.createElement(PanelView2, { onClose: handlePanelClose, onOpen: handlePanelOpen, panel: panel, previousPanel: stack[index + 1], showHeader: showPanelHeader })));
    })
        .reverse();
    var classes = classNames(Classes.PANEL_STACK2, Classes.PANEL_STACK2 + "-" + direction, props.className);
    return (React.createElement(TransitionGroup, { className: classes, component: "div" }, panels));
};
PanelStack2.displayName = DISPLAYNAME_PREFIX + ".PanelStack2";
//# sourceMappingURL=panelStack2.js.map