/// <reference types="react" />
import { AbstractPureComponent2 } from "../../common";
import { HTMLDivProps, Props } from "../../common/props";
export declare type NavbarHeadingProps = INavbarHeadingProps;
/** @deprecated use NavbarHeadingProps */
export interface INavbarHeadingProps extends Props, HTMLDivProps {
}
export declare class NavbarHeading extends AbstractPureComponent2<NavbarHeadingProps> {
    static displayName: string;
    render(): JSX.Element;
}
