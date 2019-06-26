/// <reference types="react" />
import * as React from "react";
import { HTMLDivProps, IProps } from "../../common/props";
export interface INavbarHeadingProps extends IProps, HTMLDivProps {
}
export declare class NavbarHeading extends React.PureComponent<INavbarHeadingProps, {}> {
    static displayName: string;
    render(): JSX.Element;
}
