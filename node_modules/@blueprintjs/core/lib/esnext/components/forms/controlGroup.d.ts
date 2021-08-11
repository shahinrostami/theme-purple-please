/// <reference types="react" />
import { AbstractPureComponent2 } from "../../common";
import { HTMLDivProps, Props } from "../../common/props";
export declare type ControlGroupProps = IControlGroupProps;
/** @deprecated use ControlGroupProps */
export interface IControlGroupProps extends Props, HTMLDivProps {
    /**
     * Whether the control group should take up the full width of its container.
     *
     * @default false
     */
    fill?: boolean;
    /**
     * Whether the control group should appear with vertical styling.
     *
     * @default false
     */
    vertical?: boolean;
}
export declare class ControlGroup extends AbstractPureComponent2<ControlGroupProps> {
    static displayName: string;
    render(): JSX.Element;
}
