import * as React from "react";
import { Props } from "../../common/props";
export declare type MenuDividerProps = IMenuDividerProps;
/** @deprecated use MenuDividerProps */
export interface IMenuDividerProps extends Props {
    /** This component does not support children. */
    children?: never;
    /** Optional header title. */
    title?: React.ReactNode;
}
export declare class MenuDivider extends React.Component<MenuDividerProps> {
    static displayName: string;
    render(): JSX.Element;
}
