import * as React from "react";
import { HotkeysDialog2Props } from "../../components/hotkeys/hotkeysDialog2";
import { HotkeyConfig } from "../../hooks";
interface HotkeysContextState {
    /** List of hotkeys accessible in the current scope, registered by currently mounted components, can be global or local. */
    hotkeys: HotkeyConfig[];
    /** Whether the global hotkeys dialog is open. */
    isDialogOpen: boolean;
}
declare type HotkeysAction = {
    type: "ADD_HOTKEYS" | "REMOVE_HOTKEYS";
    payload: HotkeyConfig[];
} | {
    type: "CLOSE_DIALOG" | "OPEN_DIALOG";
};
export declare type HotkeysContextInstance = [HotkeysContextState, React.Dispatch<HotkeysAction>];
/**
 * A React context used to register and deregister hotkeys as components are mounted and unmounted in an application.
 * Users should take care to make sure that only _one_ of these is instantiated and used within an application, especially
 * if using global hotkeys.
 *
 * You will likely not be using this HotkeysContext directly, except in cases where you need to get a direct handle on an
 * exisitng context instance for advanced use cases involving nested HotkeysProviders.
 *
 * For more information, see the [HotkeysProvider documentation](https://blueprintjs.com/docs/#core/context/hotkeys-provider).
 */
export declare const HotkeysContext: React.Context<HotkeysContextInstance>;
export interface HotkeysProviderProps {
    /** The component subtree which will have access to this hotkeys context. */
    children: React.ReactChild;
    /** Optional props to customize the rendered hotkeys dialog. */
    dialogProps?: Partial<Omit<HotkeysDialog2Props, "hotkeys">>;
    /** If provided, this dialog render function will be used in place of the default implementation. */
    renderDialog?: (state: HotkeysContextState, contextActions: {
        handleDialogClose: () => void;
    }) => JSX.Element;
    /** If provided, we will use this context instance instead of generating our own. */
    value?: HotkeysContextInstance;
}
/**
 * Hotkeys context provider, necessary for the `useHotkeys` hook.
 */
export declare const HotkeysProvider: ({ children, dialogProps, renderDialog, value }: HotkeysProviderProps) => JSX.Element;
export {};
