"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var classnames_1 = tslib_1.__importDefault(require("classnames"));
var React = tslib_1.__importStar(require("react"));
var Classes = tslib_1.__importStar(require("../../common/classes"));
var props_1 = require("../../common/props");
var utils_1 = require("../../common/utils");
var ProgressBar = /** @class */ (function (_super) {
    tslib_1.__extends(ProgressBar, _super);
    function ProgressBar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProgressBar.prototype.render = function () {
        var _a = this.props, _b = _a.animate, animate = _b === void 0 ? true : _b, className = _a.className, intent = _a.intent, _c = _a.stripes, stripes = _c === void 0 ? true : _c, value = _a.value;
        var classes = classnames_1.default(Classes.PROGRESS_BAR, Classes.intentClass(intent), (_d = {}, _d[Classes.PROGRESS_NO_ANIMATION] = !animate, _d[Classes.PROGRESS_NO_STRIPES] = !stripes, _d), className);
        // don't set width if value is null (rely on default CSS value)
        var width = value == null ? null : 100 * utils_1.clamp(value, 0, 1) + "%";
        return (React.createElement("div", { className: classes },
            React.createElement("div", { className: Classes.PROGRESS_METER, style: { width: width } })));
        var _d;
    };
    ProgressBar.displayName = props_1.DISPLAYNAME_PREFIX + ".ProgressBar";
    return ProgressBar;
}(React.PureComponent));
exports.ProgressBar = ProgressBar;
//# sourceMappingURL=progressBar.js.map