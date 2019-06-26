/// <reference types="react" />
import * as React from "react";
import { IProps } from "../../common/props";
export interface IDividerProps extends IProps, React.HTMLAttributes<HTMLElement> {
    /**
     * HTML tag to use for element.
     * @default "div"
     */
    tagName?: keyof JSX.IntrinsicElements;
}
export declare class Divider extends React.PureComponent<IDividerProps> {
    static displayName: string;
    render(): JSX.Element;
}
