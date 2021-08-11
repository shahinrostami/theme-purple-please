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
import { AbstractPureComponent2, Classes, refHandler, setRef } from "../../common";
import { DISPLAYNAME_PREFIX } from "../../common/props";
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var TextArea = /** @class */ (function (_super) {
    __extends(TextArea, _super);
    function TextArea() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {};
        // used to measure and set the height of the component on first mount
        _this.textareaElement = null;
        _this.handleRef = refHandler(_this, "textareaElement", _this.props.inputRef);
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
            setRef(prevProps.inputRef, null);
            this.handleRef = refHandler(this, "textareaElement", this.props.inputRef);
            setRef(this.props.inputRef, this.textareaElement);
        }
    };
    TextArea.prototype.render = function () {
        var _a;
        var _b = this.props, className = _b.className, fill = _b.fill, inputRef = _b.inputRef, intent = _b.intent, large = _b.large, small = _b.small, growVertically = _b.growVertically, htmlProps = __rest(_b, ["className", "fill", "inputRef", "intent", "large", "small", "growVertically"]);
        var rootClasses = classNames(Classes.INPUT, Classes.intentClass(intent), (_a = {},
            _a[Classes.FILL] = fill,
            _a[Classes.LARGE] = large,
            _a[Classes.SMALL] = small,
            _a), className);
        // add explicit height style while preserving user-supplied styles if they exist
        var _c = htmlProps.style, style = _c === void 0 ? {} : _c;
        if (growVertically && this.state.height != null) {
            // this style object becomes non-extensible when mounted (at least in the enzyme renderer),
            // so we make a new one to add a property
            style = __assign(__assign({}, style), { height: this.state.height + "px" });
        }
        return (React.createElement("textarea", __assign({}, htmlProps, { className: rootClasses, onChange: this.handleChange, ref: this.handleRef, style: style })));
    };
    TextArea.displayName = DISPLAYNAME_PREFIX + ".TextArea";
    TextArea = __decorate([
        polyfill
    ], TextArea);
    return TextArea;
}(AbstractPureComponent2));
export { TextArea };
//# sourceMappingURL=textArea.js.map