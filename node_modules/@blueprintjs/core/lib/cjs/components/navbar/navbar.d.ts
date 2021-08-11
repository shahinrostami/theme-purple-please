/// <reference types="react" />
import { AbstractPureComponent2 } from "../../common";
import { HTMLDivProps, Props } from "../../common/props";
import { NavbarDivider } from "./navbarDivider";
import { NavbarGroup } from "./navbarGroup";
import { NavbarHeading } from "./navbarHeading";
export { INavbarDividerProps, NavbarDividerProps } from "./navbarDivider";
export declare type NavbarProps = INavbarProps;
/** @deprecated use NavbarProps */
export interface INavbarProps extends Props, HTMLDivProps {
    /**
     * Whether this navbar should be fixed to the top of the viewport (using CSS `position: fixed`).
     */
    fixedToTop?: boolean;
}
export declare class Navbar extends AbstractPureComponent2<NavbarProps> {
    static displayName: string;
    static Divider: typeof NavbarDivider;
    static Group: typeof NavbarGroup;
    static Heading: typeof NavbarHeading;
    render(): JSX.Element;
}
