/// <reference types="react" />
import { AbstractPureComponent2 } from "../../common";
import { HTMLDivProps, Props } from "../../common/props";
export declare type NavbarDividerProps = INavbarDividerProps;
/** @deprecated use NavbarDividerProps */
export interface INavbarDividerProps extends Props, HTMLDivProps {
}
export declare class NavbarDivider extends AbstractPureComponent2<NavbarDividerProps> {
    static displayName: string;
    render(): JSX.Element;
}
