import * as React from "react";
import { AbstractPureComponent2, IRef } from "../../common";
import { IntentProps, Props } from "../../common/props";
export declare type TextAreaProps = ITextAreaProps;
/** @deprecated use TextAreaProps */
export interface ITextAreaProps extends IntentProps, Props, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /**
     * Whether the text area should take up the full width of its container.
     */
    fill?: boolean;
    /**
     * Whether the text area should appear with large styling.
     */
    large?: boolean;
    /**
     * Whether the text area should appear with small styling.
     */
    small?: boolean;
    /**
     * Whether the text area should automatically grow vertically to accomodate content.
     */
    growVertically?: boolean;
    /**
     * Ref handler that receives HTML `<textarea>` element backing this component.
     */
    inputRef?: IRef<HTMLTextAreaElement>;
}
export interface ITextAreaState {
    height?: number;
}
export declare class TextArea extends AbstractPureComponent2<TextAreaProps, ITextAreaState> {
    static displayName: string;
    state: ITextAreaState;
    textareaElement: HTMLTextAreaElement | null;
    private handleRef;
    componentDidMount(): void;
    componentDidUpdate(prevProps: TextAreaProps): void;
    render(): JSX.Element;
    private handleChange;
}
