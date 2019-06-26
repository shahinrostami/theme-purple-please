"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var classnames_1 = tslib_1.__importDefault(require("classnames"));
var React = tslib_1.__importStar(require("react"));
var Classes = tslib_1.__importStar(require("../../common/classes"));
var props_1 = require("../../common/props");
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var TextArea = /** @class */ (function (_super) {
    tslib_1.__extends(TextArea, _super);
    function TextArea() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {};
        _this.handleChange = function (e) {
            if (_this.props.growVertically) {
                _this.setState({
                    height: e.target.scrollHeight,
                });
            }
            if (_this.props.onChange != null) {
                _this.props.onChange(e);
            }
        };
        return _this;
    }
    TextArea.prototype.render = function () {
        var _a = this.props, className = _a.className, fill = _a.fill, inputRef = _a.inputRef, intent = _a.intent, large = _a.large, small = _a.small, growVertically = _a.growVertically, htmlProps = tslib_1.__rest(_a, ["className", "fill", "inputRef", "intent", "large", "small", "growVertically"]);
        var rootClasses = classnames_1.default(Classes.INPUT, Classes.intentClass(intent), (_b = {},
            _b[Classes.FILL] = fill,
            _b[Classes.LARGE] = large,
            _b[Classes.SMALL] = small,
            _b), className);
        // add explicit height style while preserving user-supplied styles if they exist
        var _c = htmlProps.style, style = _c === void 0 ? {} : _c;
        if (growVertically && this.state.height != null) {
            // this style object becomes non-extensible when mounted (at least in the enzyme renderer),
            // so we make a new one to add a property
            style = tslib_1.__assign({}, style, { height: this.state.height + "px" });
        }
        return (React.createElement("textarea", tslib_1.__assign({}, htmlProps, { className: rootClasses, onChange: this.handleChange, ref: inputRef, style: style })));
        var _b;
    };
    TextArea.displayName = props_1.DISPLAYNAME_PREFIX + ".TextArea";
    return TextArea;
}(React.PureComponent));
exports.TextArea = TextArea;
//# sourceMappingURL=textArea.js.map