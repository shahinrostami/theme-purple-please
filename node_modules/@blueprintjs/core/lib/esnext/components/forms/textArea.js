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
import { DISPLAYNAME_PREFIX } from "../../common/props";
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
export class TextArea extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {};
        this.handleChange = (e) => {
            if (this.props.growVertically) {
                this.setState({
                    height: e.target.scrollHeight,
                });
            }
            if (this.props.onChange != null) {
                this.props.onChange(e);
            }
        };
    }
    render() {
        const { className, fill, inputRef, intent, large, small, growVertically, ...htmlProps } = this.props;
        const rootClasses = classNames(Classes.INPUT, Classes.intentClass(intent), {
            [Classes.FILL]: fill,
            [Classes.LARGE]: large,
            [Classes.SMALL]: small,
        }, className);
        // add explicit height style while preserving user-supplied styles if they exist
        let { style = {} } = htmlProps;
        if (growVertically && this.state.height != null) {
            // this style object becomes non-extensible when mounted (at least in the enzyme renderer),
            // so we make a new one to add a property
            style = {
                ...style,
                height: `${this.state.height}px`,
            };
        }
        return (React.createElement("textarea", Object.assign({}, htmlProps, { className: rootClasses, onChange: this.handleChange, ref: inputRef, style: style })));
    }
}
TextArea.displayName = `${DISPLAYNAME_PREFIX}.TextArea`;
//# sourceMappingURL=textArea.js.map