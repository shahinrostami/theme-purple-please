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
import * as Classes from "../../common/classes";
import { DISPLAYNAME_PREFIX } from "../../common/props";
import { Popover, PopoverInteractionKind } from "../popover/popover";
export class Tooltip extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.popover = null;
    }
    render() {
        const { children, intent, popoverClassName, ...restProps } = this.props;
        const classes = classNames(Classes.TOOLTIP, Classes.intentClass(intent), popoverClassName);
        return (React.createElement(Popover, Object.assign({ interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY }, restProps, { autoFocus: false, canEscapeKeyClose: false, enforceFocus: false, lazy: true, popoverClassName: classes, portalContainer: this.props.portalContainer, ref: ref => (this.popover = ref) }), children));
    }
    reposition() {
        if (this.popover != null) {
            this.popover.reposition();
        }
    }
}
Tooltip.displayName = `${DISPLAYNAME_PREFIX}.Tooltip`;
Tooltip.defaultProps = {
    hoverCloseDelay: 0,
    hoverOpenDelay: 100,
    transitionDuration: 100,
};
//# sourceMappingURL=tooltip.js.map