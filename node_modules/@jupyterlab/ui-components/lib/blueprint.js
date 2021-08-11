// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { Button as BPButton } from '@blueprintjs/core/lib/cjs/components/button/buttons';
import { Collapse as BPCollapse } from '@blueprintjs/core/lib/cjs/components/collapse/collapse';
import { Checkbox as BPCheckbox } from '@blueprintjs/core/lib/cjs/components/forms/controls';
import { InputGroup as BPInputGroup } from '@blueprintjs/core/lib/cjs/components/forms/inputGroup';
import { Select as BPSelect } from '@blueprintjs/select/lib/cjs/components/select/select';
import * as React from 'react';
import { LabIcon } from './icon';
import { classes } from './utils';
export { Intent } from '@blueprintjs/core/lib/cjs/common/intent';
export const Button = (props) => (React.createElement(BPButton, Object.assign({}, props, { className: classes(props.className, props.minimal ? 'minimal' : '', 'jp-Button') })));
export const InputGroup = (props) => {
    if (props.rightIcon) {
        return (React.createElement(BPInputGroup, Object.assign({}, props, { className: classes(props.className, 'jp-InputGroup'), rightElement: React.createElement("div", { className: "jp-InputGroupAction" },
                React.createElement(LabIcon.resolveReact, { icon: props.rightIcon })) })));
    }
    return (React.createElement(BPInputGroup, Object.assign({}, props, { className: classes(props.className, 'jp-InputGroup') })));
};
export const Collapse = (props) => (React.createElement(BPCollapse, Object.assign({}, props)));
export const Select = (props) => (React.createElement(BPSelect, Object.assign({}, props, { className: classes(props.className, 'jp-Select') })));
export const Checkbox = (props) => (React.createElement(BPCheckbox, Object.assign({}, props, { className: classes(props.className, 'jp-Checkbox') })));
//# sourceMappingURL=blueprint.js.map