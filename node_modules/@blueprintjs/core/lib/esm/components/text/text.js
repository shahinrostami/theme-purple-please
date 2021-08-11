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
import { __assign, __decorate, __extends, __rest } from "tslib";
import classNames from "classnames";
import * as React from "react";
import { polyfill } from "react-lifecycles-compat";
import { AbstractPureComponent2, Classes } from "../../common";
import { DISPLAYNAME_PREFIX } from "../../common/props";
var Text = /** @class */ (function (_super) {
    __extends(Text, _super);
    function Text() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isContentOverflowing: false,
            textContent: "",
        };
        _this.textRef = null;
        return _this;
    }
    Text.prototype.componentDidMount = function () {
        this.update();
    };
    Text.prototype.componentDidUpdate = function () {
        this.update();
    };
    Text.prototype.render = function () {
        var _a;
        var _this = this;
        var _b = this.props, children = _b.children, className = _b.className, ellipsize = _b.ellipsize, _c = _b.tagName, tagName = _c === void 0 ? "div" : _c, title = _b.title, htmlProps = __rest(_b, ["children", "className", "ellipsize", "tagName", "title"]);
        var classes = classNames(className, (_a = {},
            _a[Classes.TEXT_OVERFLOW_ELLIPSIS] = ellipsize,
            _a));
        return React.createElement(tagName, __assign(__assign({}, htmlProps), { className: classes, ref: function (ref) { return (_this.textRef = ref); }, title: title !== null && title !== void 0 ? title : (this.state.isContentOverflowing ? this.state.textContent : undefined) }), children);
    };
    Text.prototype.update = function () {
        var _a;
        if (((_a = this.textRef) === null || _a === void 0 ? void 0 : _a.textContent) == null) {
            return;
        }
        var newState = {
            isContentOverflowing: this.props.ellipsize && this.textRef.scrollWidth > this.textRef.clientWidth,
            textContent: this.textRef.textContent,
        };
        this.setState(newState);
    };
    Text.displayName = DISPLAYNAME_PREFIX + ".Text";
    Text.defaultProps = {
        ellipsize: false,
    };
    Text = __decorate([
        polyfill
    ], Text);
    return Text;
}(AbstractPureComponent2));
export { Text };
//# sourceMappingURL=text.js.map