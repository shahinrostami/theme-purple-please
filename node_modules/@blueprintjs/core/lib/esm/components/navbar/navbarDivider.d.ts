/// <reference types="react" />
import * as React from "react";
import { HTMLDivProps, IProps } from "../../common/props";
export interface INavbarDividerProps extends IProps, HTMLDivProps {
}
export declare class NavbarDivider extends React.PureComponent<INavbarDividerProps, {}> {
    static displayName: string;
    render(): JSX.Element;
}
