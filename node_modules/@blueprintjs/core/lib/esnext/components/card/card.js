/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
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
import { Elevation } from "../../common/elevation";
import { DISPLAYNAME_PREFIX } from "../../common/props";
export class Card extends React.PureComponent {
    render() {
        const { className, elevation, interactive, ...htmlProps } = this.props;
        const classes = classNames(Classes.CARD, { [Classes.INTERACTIVE]: interactive }, Classes.elevationClass(elevation), className);
        return React.createElement("div", Object.assign({ className: classes }, htmlProps));
    }
}
Card.displayName = `${DISPLAYNAME_PREFIX}.Card`;
Card.defaultProps = {
    elevation: Elevation.ZERO,
    interactive: false,
};
//# sourceMappingURL=card.js.map