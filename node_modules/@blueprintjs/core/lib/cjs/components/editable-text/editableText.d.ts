/// <reference types="react" />
import { AbstractPureComponent } from "../../common/abstractPureComponent";
import { IIntentProps, IProps } from "../../common/props";
export interface IEditableTextProps extends IIntentProps, IProps {
    /**
     * If `true` and in multiline mode, the `enter` key will trigger onConfirm and `mod+enter`
     * will insert a newline. If `false`, the key bindings are inverted such that `enter`
     * adds a newline.
     * @default false
     */
    confirmOnEnterKey?: boolean;
    /** Default text value of uncontrolled input. */
    defaultValue?: string;
    /**
     * Whether the text can be edited.
     * @default false
     */
    disabled?: boolean;
    /** Whether the component is currently being edited. */
    isEditing?: boolean;
    /** Maximum number of characters allowed. Unlimited by default. */
    maxLength?: number;
    /** Minimum width in pixels of the input, when not `multiline`. */
    minWidth?: number;
    /**
     * Whether the component supports multiple lines of text.
     * This prop should not be changed during the component's lifetime.
     * @default false
     */
    multiline?: boolean;
    /**
     * Maximum number of lines before scrolling begins, when `multiline`.
     */
    maxLines?: number;
    /**
     * Minimum number of lines (essentially minimum height), when `multiline`.
     * @default 1
     */
    minLines?: number;
    /**
     * Placeholder text when there is no value.
     * @default "Click to Edit"
     */
    placeholder?: string;
    /**
     * Whether the entire text field should be selected on focus.
     * If `false`, the cursor is placed at the end of the text.
     * @default false
     */
    selectAllOnFocus?: boolean;
    /**
     * The type of input that should be shown, when not `multiline`.
     */
    type?: string;
    /** Text value of controlled input. */
    value?: string;
    /** Callback invoked when user cancels input with the `esc` key. Receives last confirmed value. */
    onCancel?(value: string): void;
    /** Callback invoked when user changes input in any way. */
    onChange?(value: string): void;
    /** Callback invoked when user confirms value with `enter` key or by blurring input. */
    onConfirm?(value: string): void;
    /** Callback invoked after the user enters edit mode. */
    onEdit?(value: string): void;
}
export interface IEditableTextState {
    /** Pixel height of the input, measured from span size */
    inputHeight?: number;
    /** Pixel width of the input, measured from span size */
    inputWidth?: number;
    /** Whether the value is currently being edited */
    isEditing?: boolean;
    /** The last confirmed value */
    lastValue?: string;
    /** The controlled input value, may be different from prop during editing */
    value?: string;
}
export declare class EditableText extends AbstractPureComponent<IEditableTextProps, IEditableTextState> {
    static displayName: string;
    static defaultProps: IEditableTextProps;
    private valueElement;
    private refHandlers;
    constructor(props?: IEditableTextProps, context?: any);
    render(): JSX.Element;
    componentDidMount(): void;
    componentDidUpdate(_: IEditableTextProps, prevState: IEditableTextState): void;
    componentWillReceiveProps(nextProps: IEditableTextProps): void;
    cancelEditing: () => void;
    toggleEditing: () => void;
    private handleFocus;
    private handleTextChange;
    private handleKeyEvent;
    private maybeRenderInput(value);
    private updateInputDimensions();
}
