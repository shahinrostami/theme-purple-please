/// <reference types="react" />
import * as React from "react";
import { IElementRefProps } from "../html/html";
export interface IHTMLTableProps extends React.TableHTMLAttributes<HTMLTableElement>, IElementRefProps<HTMLTableElement> {
    /** Enables borders between rows and cells. */
    bordered?: boolean;
    /** Use small, condensed appearance. */
    condensed?: boolean;
    /** Enables hover styles on row. */
    interactive?: boolean;
    /**
     * Use small, condensed appearance for this element and all child elements.
     * @deprecated
     */
    small?: boolean;
    /** Use an alternate background color on odd rows. */
    striped?: boolean;
}
export declare class HTMLTable extends React.PureComponent<IHTMLTableProps> {
    render(): JSX.Element;
}
