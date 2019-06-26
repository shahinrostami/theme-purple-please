import { Intent, IProps } from "../../common";
export declare const HandleType: {
    FULL: "full";
    START: "start";
    END: "end";
};
export declare type HandleType = typeof HandleType[keyof typeof HandleType];
export declare const HandleInteractionKind: {
    LOCK: "lock";
    PUSH: "push";
    NONE: "none";
};
export declare type HandleInteractionKind = typeof HandleInteractionKind[keyof typeof HandleInteractionKind];
export interface IHandleProps extends IProps {
    /** Numeric value of this handle. */
    value: number;
    /** Intent for the track segment immediately after this handle, taking priority over `intentBefore`. */
    intentAfter?: Intent;
    /** Intent for the track segment immediately before this handle. */
    intentBefore?: Intent;
    /**
     * How this handle interacts with other handles.
     * @default "lock"
     */
    interactionKind?: HandleInteractionKind;
    /**
     * Callback invoked when this handle's value is changed due to a drag
     * interaction. Note that "push" interactions can cause multiple handles to
     * update at the same time.
     */
    onChange?: (newValue: number) => void;
    /** Callback invoked when this handle is released (the end of a drag interaction). */
    onRelease?: (newValue: number) => void;
    /**
     * Handle appearance type.
     * @default "full"
     */
    type?: HandleType;
}
