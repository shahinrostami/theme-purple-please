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
import { Utils } from "../../common";
import * as Classes from "../../common/classes";
import { DISPLAYNAME_PREFIX } from "../../common/props";
// TODO: write tests (ignoring for now to get a build passing quickly)
/* istanbul ignore next */
export class FileInput extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.handleInputChange = (e) => {
            Utils.safeInvoke(this.props.onInputChange, e);
            Utils.safeInvoke(this.props.inputProps.onChange, e);
        };
    }
    render() {
        const { className, disabled, fill, hasSelection, inputProps, large, onInputChange, text, ...htmlProps } = this.props;
        const rootClasses = classNames(Classes.FILE_INPUT, {
            [Classes.FILE_INPUT_HAS_SELECTION]: hasSelection,
            [Classes.DISABLED]: disabled,
            [Classes.FILL]: fill,
            [Classes.LARGE]: large,
        }, className);
        return (React.createElement("label", Object.assign({}, htmlProps, { className: rootClasses }),
            React.createElement("input", Object.assign({}, inputProps, { onChange: this.handleInputChange, type: "file", disabled: disabled })),
            React.createElement("span", { className: Classes.FILE_UPLOAD_INPUT }, text)));
    }
}
FileInput.displayName = `${DISPLAYNAME_PREFIX}.FileInput`;
FileInput.defaultProps = {
    hasSelection: false,
    inputProps: {},
    text: "Choose file...",
};
//# sourceMappingURL=fileInput.js.map