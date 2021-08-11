/// <reference types="react" />
import { AbstractPureComponent2, InputGroupProps2, IPopoverProps } from "@blueprintjs/core";
import { IListItemsProps } from "../../common";
export declare type SuggestProps<T> = ISuggestProps<T>;
/** @deprecated use SuggestProps */
export interface ISuggestProps<T> extends IListItemsProps<T> {
    /**
     * Whether the popover should close after selecting an item.
     *
     * @default true
     */
    closeOnSelect?: boolean;
    /** Whether the input field should be disabled. */
    disabled?: boolean;
    /**
     * Whether the component should take up the full width of its container.
     * This overrides `popoverProps.fill` and `inputProps.fill`.
     */
    fill?: boolean;
    /**
     * Props to spread to the query `InputGroup`. To control this input, use
     * `query` and `onQueryChange` instead of `inputProps.value` and
     * `inputProps.onChange`.
     */
    inputProps?: InputGroupProps2;
    /** Custom renderer to transform an item into a string for the input value. */
    inputValueRenderer: (item: T) => string;
    /**
     * The uncontrolled default selected item.
     * This prop is ignored if `selectedItem` is used to control the state.
     */
    defaultSelectedItem?: T;
    /**
     * The currently selected item, or `null` to indicate that no item is selected.
     * If omitted or `undefined`, this prop will be uncontrolled (managed by the component's state).
     * Use `onItemSelect` to listen for updates.
     */
    selectedItem?: T | null;
    /**
     * If true, the component waits until a keydown event in the TagInput
     * before opening its popover.
     *
     * If false, the popover opens immediately after a mouse click or TAB key
     * interaction focuses the component's TagInput.
     *
     * @default false
     */
    openOnKeyDown?: boolean;
    /** Props to spread to `Popover`. Note that `content` cannot be changed. */
    popoverProps?: Partial<IPopoverProps> & object;
    /**
     * Whether the active item should be reset to the first matching item _when
     * the popover closes_. The query will also be reset to the empty string.
     *
     * @default false
     */
    resetOnClose?: boolean;
}
export interface ISuggestState<T> {
    isOpen: boolean;
    selectedItem: T | null;
}
export declare class Suggest<T> extends AbstractPureComponent2<SuggestProps<T>, ISuggestState<T>> {
    static displayName: string;
    static defaultProps: Partial<SuggestProps<any>>;
    static ofType<U>(): new (props: SuggestProps<U>) => Suggest<U>;
    state: ISuggestState<T>;
    private TypedQueryList;
    inputElement: HTMLInputElement | null;
    private queryList;
    private handleInputRef;
    private handleQueryListRef;
    render(): JSX.Element;
    componentDidUpdate(prevProps: SuggestProps<T>, prevState: ISuggestState<T>): void;
    private renderQueryList;
    private selectText;
    private handleInputFocus;
    private handleItemSelect;
    private getInitialSelectedItem;
    private handlePopoverInteraction;
    private handlePopoverOpening;
    private handlePopoverOpened;
    private getTargetKeyDownHandler;
    private getTargetKeyUpHandler;
    private maybeResetActiveItemToSelectedItem;
}
