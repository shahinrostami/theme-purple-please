import * as React from "react";
import { InputGroupProps2, OverlayProps } from "@blueprintjs/core";
import { IListItemsProps } from "../../common";
export declare type OmnibarProps<T> = IOmnibarProps<T>;
/** @deprecated use OmnibarProps */
export interface IOmnibarProps<T> extends IListItemsProps<T> {
    /**
     * Props to spread to the query `InputGroup`. Use `query` and
     * `onQueryChange` instead of `inputProps.value` and `inputProps.onChange`
     * to control this input.
     */
    inputProps?: InputGroupProps2;
    /**
     * Toggles the visibility of the omnibar.
     * This prop is required because the component is controlled.
     */
    isOpen: boolean;
    /**
     * A callback that is invoked when user interaction causes the omnibar to
     * close, such as clicking on the overlay or pressing the `esc` key (if
     * enabled). Receives the event from the user's interaction, if there was an
     * event (generally either a mouse or key event).
     *
     * Note that due to controlled usage, this component will not actually close
     * itself until the `isOpen` prop becomes `false`.
     * .
     */
    onClose?: (event?: React.SyntheticEvent<HTMLElement>) => void;
    /** Props to spread to `Overlay`. */
    overlayProps?: Partial<OverlayProps>;
}
export declare class Omnibar<T> extends React.PureComponent<OmnibarProps<T>> {
    static displayName: string;
    static ofType<U>(): new (props: OmnibarProps<U>) => Omnibar<U>;
    private TypedQueryList;
    render(): JSX.Element;
    private renderQueryList;
    private handleOverlayClose;
}
