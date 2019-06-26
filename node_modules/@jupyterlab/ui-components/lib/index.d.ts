import * as React from 'react';
import { IButtonProps as IBPButtonProps } from '@blueprintjs/core/lib/cjs/components/button/buttons';
import { IIconProps } from '@blueprintjs/core/lib/cjs/components/icon/icon';
import { ICollapseProps } from '@blueprintjs/core/lib/cjs/components/collapse/collapse';
import { IInputGroupProps as IBPInputGroupProps } from '@blueprintjs/core/lib/cjs/components/forms/inputGroup';
import { IHTMLSelectProps } from '@blueprintjs/core/lib/cjs/components/html-select/htmlSelect';
import { ISelectProps } from '@blueprintjs/select/lib/cjs/components/select/select';
export { Intent } from '@blueprintjs/core/lib/cjs/common/intent';
interface IButtonProps extends IBPButtonProps {
    title?: string;
    type?: 'button' | 'submit' | 'reset';
}
interface IInputGroupProps extends IBPInputGroupProps {
    rightIcon?: IIconProps['icon'];
}
export declare const Button: (props: IButtonProps & React.DOMAttributes<any>) => JSX.Element;
export declare const InputGroup: (props: IInputGroupProps & React.DOMAttributes<any>) => JSX.Element;
export declare const Icon: (props: IIconProps) => JSX.Element;
export declare const Collapse: (props: ICollapseProps & React.DOMAttributes<any>) => JSX.Element;
export declare const HTMLSelect: (props: IHTMLSelectProps & React.DOMAttributes<any>) => JSX.Element;
export declare const Select: (props: ISelectProps<any> & React.DOMAttributes<any>) => JSX.Element;
