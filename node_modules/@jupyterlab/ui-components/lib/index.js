// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import * as React from 'react';
import { Button as BPButton } from '@blueprintjs/core/lib/cjs/components/button/buttons';
import { Icon as BPIcon } from '@blueprintjs/core/lib/cjs/components/icon/icon';
import { Collapse as BPCollapse } from '@blueprintjs/core/lib/cjs/components/collapse/collapse';
import { InputGroup as BPInputGroup } from '@blueprintjs/core/lib/cjs/components/forms/inputGroup';
import { HTMLSelect as BPHTMLSelect } from '@blueprintjs/core/lib/cjs/components/html-select/htmlSelect';
import { Select as BPSelect } from '@blueprintjs/select/lib/cjs/components/select/select';
import { combineClassNames } from './utils';
export { Intent } from '@blueprintjs/core/lib/cjs/common/intent';
export const Button = (props) => (React.createElement(BPButton, Object.assign({}, props, { className: combineClassNames(props.className, props.minimal && 'minimal', 'jp-Button') })));
export const InputGroup = (props) => {
    if (props.rightIcon) {
        return (React.createElement(BPInputGroup, Object.assign({}, props, { className: combineClassNames(props.className, 'jp-InputGroup'), rightElement: React.createElement("div", { className: "jp-InputGroupAction" },
                React.createElement(Icon, { className: "jp-Icon", icon: props.rightIcon })) })));
    }
    return (React.createElement(BPInputGroup, Object.assign({}, props, { className: combineClassNames(props.className, 'jp-InputGroup') })));
};
export const Icon = (props) => (React.createElement(BPIcon, Object.assign({}, props, { className: combineClassNames(props.className, 'jp-Icon') })));
export const Collapse = (props) => (React.createElement(BPCollapse, Object.assign({}, props)));
export const HTMLSelect = (props) => (React.createElement(BPHTMLSelect, Object.assign({}, props, { className: combineClassNames(props.className, 'jp-HTMLSelect') })));
export const Select = (props) => (React.createElement(BPSelect, Object.assign({}, props, { className: combineClassNames(props.className, 'jp-Select') })));
//# sourceMappingURL=index.js.map