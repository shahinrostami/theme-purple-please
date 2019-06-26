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
import { Utils } from "../../common";
import * as Classes from "../../common/classes";
import { DISPLAYNAME_PREFIX } from "../../common/props";
// TODO: write tests (ignoring for now to get a build passing quickly)
/* istanbul ignore next */
var FileInput = /** @class */ (function (_super) {
    tslib_1.__extends(FileInput, _super);
    function FileInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleInputChange = function (e) {
            Utils.safeInvoke(_this.props.onInputChange, e);
            Utils.safeInvoke(_this.props.inputProps.onChange, e);
        };
        return _this;
    }
    FileInput.prototype.render = function () {
        var _a = this.props, className = _a.className, disabled = _a.disabled, fill = _a.fill, hasSelection = _a.hasSelection, inputProps = _a.inputProps, large = _a.large, onInputChange = _a.onInputChange, text = _a.text, htmlProps = tslib_1.__rest(_a, ["className", "disabled", "fill", "hasSelection", "inputProps", "large", "onInputChange", "text"]);
        var rootClasses = classNames(Classes.FILE_INPUT, (_b = {},
            _b[Classes.FILE_INPUT_HAS_SELECTION] = hasSelection,
            _b[Classes.DISABLED] = disabled,
            _b[Classes.FILL] = fill,
            _b[Classes.LARGE] = large,
            _b), className);
        return (React.createElement("label", tslib_1.__assign({}, htmlProps, { className: rootClasses }),
            React.createElement("input", tslib_1.__assign({}, inputProps, { onChange: this.handleInputChange, type: "file", disabled: disabled })),
            React.createElement("span", { className: Classes.FILE_UPLOAD_INPUT }, text)));
        var _b;
    };
    FileInput.displayName = DISPLAYNAME_PREFIX + ".FileInput";
    FileInput.defaultProps = {
        hasSelection: false,
        inputProps: {},
        text: "Choose file...",
    };
    return FileInput;
}(React.PureComponent));
export { FileInput };
//# sourceMappingURL=fileInput.js.map