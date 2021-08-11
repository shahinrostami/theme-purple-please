import * as React from "react";
import { AbstractPureComponent2 } from "../../common";
import { HTMLDivProps, Props } from "../../common/props";
import { ButtonProps } from "../button/buttons";
export declare type DialogStepId = string | number;
export declare type DialogStepButtonProps = Partial<Pick<ButtonProps, "disabled" | "text">>;
export declare type DialogStepProps = IDialogStepProps;
/** @deprecated use DialogStepProps */
export interface IDialogStepProps extends Props, Omit<HTMLDivProps, "id" | "title" | "onClick"> {
    /**
     * Unique identifier used to identify which step is selected.
     */
    id: DialogStepId;
    /**
     * Panel content, rendered by the parent `MultistepDialog` when this step is active.
     */
    panel: JSX.Element;
    /**
     * Space-delimited string of class names applied to multistep dialog panel container.
     */
    panelClassName?: string;
    /**
     * Content of step title element, rendered in a list left of the active panel.
     */
    title?: React.ReactNode;
    /**
     * Props for the back button.
     */
    backButtonProps?: DialogStepButtonProps;
    /**
     * Props for the next button.
     */
    nextButtonProps?: DialogStepButtonProps;
}
export declare class DialogStep extends AbstractPureComponent2<DialogStepProps> {
    static displayName: string;
    render(): JSX.Element;
}
