/// <reference types="react" />
import * as React from "react";
import { HTMLDivProps, IProps } from "../../common/props";
export interface IControlGroupProps extends IProps, HTMLDivProps {
    /**
     * Whether the control group should take up the full width of its container.
     * @default false
     */
    fill?: boolean;
    /**
     * Whether the control group should appear with vertical styling.
     * @default false
     */
    vertical?: boolean;
}
export declare class ControlGroup extends React.PureComponent<IControlGroupProps, {}> {
    static displayName: string;
    render(): JSX.Element;
}
