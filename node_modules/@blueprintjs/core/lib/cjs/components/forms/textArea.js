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
exports.TextArea = void 0;
var tslib_1 = require("tslib");
var classnames_1 = tslib_1.__importDefault(require("classnames"));
var React = tslib_1.__importStar(require("react"));
var react_lifecycles_compat_1 = require("react-lifecycles-compat");
var common_1 = require("../../common");
var props_1 = require("../../common/props");
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var TextArea = /** @class */ (function (_super) {
    tslib_1.__extends(TextArea, _super);
    function TextArea() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {};
        // used to measure and set the height of the component on first mount
        _this.textareaElement = null;
        _this.handleRef = common_1.refHandler(_this, "textareaElement", _this.props.inputRef);
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
    TextArea.prototype.componentDidMount = function () {
        var _a;
        if (this.props.growVertically && this.textareaElement !== null) {
            // HACKHACK: this should probably be done in getSnapshotBeforeUpdate
            /* eslint-disable-next-line react/no-did-mount-set-state */
            this.setState({
                height: (_a = this.textareaElement) === null || _a === void 0 ? void 0 : _a.scrollHeight,
            });
        }
    };
    TextArea.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.inputRef !== this.props.inputRef) {
            common_1.setRef(prevProps.inputRef, null);
            this.handleRef = common_1.refHandler(this, "textareaElement", this.props.inputRef);
            common_1.setRef(this.props.inputRef, this.textareaElement);
        }
    };
    TextArea.prototype.render = function () {
        var _a;
        var _b = this.props, className = _b.className, fill = _b.fill, inputRef = _b.inputRef, intent = _b.intent, large = _b.large, small = _b.small, growVertically = _b.growVertically, htmlProps = tslib_1.__rest(_b, ["className", "fill", "inputRef", "intent", "large", "small", "growVertically"]);
        var rootClasses = classnames_1.default(common_1.Classes.INPUT, common_1.Classes.intentClass(intent), (_a = {},
            _a[common_1.Classes.FILL] = fill,
            _a[common_1.Classes.LARGE] = large,
            _a[common_1.Classes.SMALL] = small,
            _a), className);
        // add explicit height style while preserving user-supplied styles if they exist
        var _c = htmlProps.style, style = _c === void 0 ? {} : _c;
        if (growVertically && this.state.height != null) {
            // this style object becomes non-extensible when mounted (at least in the enzyme renderer),
            // so we make a new one to add a property
            style = tslib_1.__assign(tslib_1.__assign({}, style), { height: this.state.height + "px" });
        }
        return (React.createElement("textarea", tslib_1.__assign({}, htmlProps, { className: rootClasses, onChange: this.handleChange, ref: this.handleRef, style: style })));
    };
    TextArea.displayName = props_1.DISPLAYNAME_PREFIX + ".TextArea";
    TextArea = tslib_1.__decorate([
        react_lifecycles_compat_1.polyfill
    ], TextArea);
    return TextArea;
}(common_1.AbstractPureComponent2));
exports.TextArea = TextArea;
//# sourceMappingURL=textArea.js.map