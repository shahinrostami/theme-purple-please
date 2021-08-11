/// <reference types="react" />
import { AbstractPureComponent2, Boundary, Props } from "../../common";
import { OverflowListProps } from "../overflow-list/overflowList";
import { IPopoverProps } from "../popover/popover";
import { BreadcrumbProps } from "./breadcrumb";
export declare type BreadcrumbsProps = IBreadcrumbsProps;
/** @deprecated use BreadcrumbsProps */
export interface IBreadcrumbsProps extends Props {
    /**
     * Callback invoked to render visible breadcrumbs. Best practice is to
     * render a `<Breadcrumb>` element. If `currentBreadcrumbRenderer` is also
     * supplied, that callback will be used for the current breadcrumb instead.
     *
     * @default Breadcrumb
     */
    breadcrumbRenderer?: (props: BreadcrumbProps) => JSX.Element;
    /**
     * Which direction the breadcrumbs should collapse from: start or end.
     *
     * @default Boundary.START
     */
    collapseFrom?: Boundary;
    /**
     * Callback invoked to render the current breadcrumb, which is the last
     * element in the `items` array.
     *
     * If this prop is omitted, `breadcrumbRenderer` will be invoked for the
     * current breadcrumb instead.
     */
    currentBreadcrumbRenderer?: (props: BreadcrumbProps) => JSX.Element;
    /**
     * All breadcrumbs to display. Breadcrumbs that do not fit in the container
     * will be rendered in an overflow menu instead.
     */
    items: BreadcrumbProps[];
    /**
     * The minimum number of visible breadcrumbs that should never collapse into
     * the overflow menu, regardless of DOM dimensions.
     *
     * @default 0
     */
    minVisibleItems?: number;
    /**
     * Props to spread to `OverflowList`. Note that `items`,
     * `overflowRenderer`, and `visibleItemRenderer` cannot be changed.
     */
    overflowListProps?: Partial<OverflowListProps<BreadcrumbProps>>;
    /**
     * Props to spread to the `Popover` showing the overflow menu.
     */
    popoverProps?: IPopoverProps;
}
export declare class Breadcrumbs extends AbstractPureComponent2<BreadcrumbsProps> {
    static defaultProps: Partial<BreadcrumbsProps>;
    render(): JSX.Element;
    private renderOverflow;
    private renderOverflowBreadcrumb;
    private renderBreadcrumbWrapper;
    private renderBreadcrumb;
}
