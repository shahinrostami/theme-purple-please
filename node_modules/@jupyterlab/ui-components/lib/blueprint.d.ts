import { IButtonProps as IBPButtonProps } from '@blueprintjs/core/lib/cjs/components/button/buttons';
import { ICollapseProps } from '@blueprintjs/core/lib/cjs/components/collapse/collapse';
import { ICheckboxProps } from '@blueprintjs/core/lib/cjs/components/forms/controls';
import { IInputGroupProps as IBPInputGroupProps } from '@blueprintjs/core/lib/cjs/components/forms/inputGroup';
import { ISelectProps } from '@blueprintjs/select/lib/cjs/components/select/select';
import * as React from 'react';
export { Intent } from '@blueprintjs/core/lib/cjs/common/intent';
interface IButtonProps extends IBPButtonProps {
    title?: string;
    type?: 'button' | 'submit' | 'reset';
}
interface IInputGroupProps extends IBPInputGroupProps {
    rightIcon?: string;
}
declare type CommonProps<T> = React.DOMAttributes<T>;
export declare const Button: (props: IButtonProps & CommonProps<any>) => JSX.Element;
export declare const InputGroup: (props: IInputGroupProps & CommonProps<any>) => JSX.Element;
export declare const Collapse: (props: ICollapseProps & CommonProps<any>) => JSX.Element;
export declare const Select: (props: ISelectProps<any> & CommonProps<any>) => JSX.Element;
export declare const Checkbox: (props: ICheckboxProps & CommonProps<any>) => JSX.Element;
