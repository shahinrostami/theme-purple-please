import * as React from "react";
import { Boundary } from "../../common/boundary";
import { Props } from "../../common/props";
import { MenuItemProps } from "../menu/menuItem";
import { IPopoverProps } from "../popover/popover";
export declare type CollapsibleListProps = ICollapsibleListProps;
/** @deprecated use CollapsibleListProps */
export interface ICollapsibleListProps extends Props {
    /**
     * Element to render as dropdown target with `CLICK` interaction to show collapsed menu.
     */
    dropdownTarget: JSX.Element;
    /**
     * Props to pass to the dropdown.
     */
    dropdownProps?: IPopoverProps;
    /**
     * Callback invoked to render each visible item. The item will be wrapped in an `li` with
     * the optional `visibleItemClassName` prop.
     */
    visibleItemRenderer: (props: MenuItemProps, index: number) => JSX.Element;
    /**
     * Which direction the items should collapse from: start or end of the children.
     *
     * @default Boundary.START
     */
    collapseFrom?: Boundary;
    /**
     * CSS class names to add to `<li>` tags containing each visible item and the dropdown.
     */
    visibleItemClassName?: string;
    /**
     * Exact number of visible items.
     *
     * @default 3
     */
    visibleItemCount?: number;
}
/** @deprecated use `<OverflowList>` for automatic overflow based on available space. */
export declare class CollapsibleList extends React.Component<CollapsibleListProps> {
    static displayName: string;
    static defaultProps: Partial<CollapsibleListProps>;
    render(): JSX.Element;
    private partitionChildren;
}
