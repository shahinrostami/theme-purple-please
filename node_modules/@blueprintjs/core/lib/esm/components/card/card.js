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
import * as tslib_1 from "tslib";
import classNames from "classnames";
import * as React from "react";
import * as Classes from "../../common/classes";
import { Elevation } from "../../common/elevation";
import { DISPLAYNAME_PREFIX } from "../../common/props";
var Card = /** @class */ (function (_super) {
    tslib_1.__extends(Card, _super);
    function Card() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Card.prototype.render = function () {
        var _a = this.props, className = _a.className, elevation = _a.elevation, interactive = _a.interactive, htmlProps = tslib_1.__rest(_a, ["className", "elevation", "interactive"]);
        var classes = classNames(Classes.CARD, (_b = {}, _b[Classes.INTERACTIVE] = interactive, _b), Classes.elevationClass(elevation), className);
        return React.createElement("div", tslib_1.__assign({ className: classes }, htmlProps));
        var _b;
    };
    Card.displayName = DISPLAYNAME_PREFIX + ".Card";
    Card.defaultProps = {
        elevation: Elevation.ZERO,
        interactive: false,
    };
    return Card;
}(React.PureComponent));
export { Card };
//# sourceMappingURL=card.js.map