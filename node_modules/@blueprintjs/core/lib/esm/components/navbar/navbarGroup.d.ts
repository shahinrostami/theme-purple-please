/// <reference types="react" />
import { AbstractPureComponent2, Alignment } from "../../common";
import { HTMLDivProps, Props } from "../../common/props";
export declare type NavbarGroupProps = INavbarGroupProps;
/** @deprecated use NavbarGroupProps */
export interface INavbarGroupProps extends Props, HTMLDivProps {
    /**
     * The side of the navbar on which the group should appear.
     * The `Alignment` enum provides constants for these values.
     *
     * @default Alignment.LEFT
     */
    align?: Alignment;
}
export declare class NavbarGroup extends AbstractPureComponent2<NavbarGroupProps> {
    static displayName: string;
    static defaultProps: NavbarGroupProps;
    render(): JSX.Element;
}
