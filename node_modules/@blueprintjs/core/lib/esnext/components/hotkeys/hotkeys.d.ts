/// <reference types="react" />
import * as React from "react";
import { AbstractPureComponent, IProps } from "../../common";
export { Hotkey, IHotkeyProps } from "./hotkey";
export { KeyCombo, IKeyComboProps } from "./keyCombo";
export { HotkeysTarget, IHotkeysTargetComponent } from "./hotkeysTarget";
export { IKeyCombo, comboMatches, getKeyCombo, getKeyComboString, parseKeyCombo } from "./hotkeyParser";
export { IHotkeysDialogProps, hideHotkeysDialog, setHotkeysDialogProps } from "./hotkeysDialog";
export interface IHotkeysProps extends IProps {
    /**
     * In order to make local hotkeys work on elements that are not normally
     * focusable, such as `<div>`s or `<span>`s, we add a `tabIndex` attribute
     * to the hotkey target, which makes it focusable. By default, we use `0`,
     * but you can override this value to change the tab navigation behavior
     * of the component. You may even set this value to `null`, which will omit
     * the `tabIndex` from the component decorated by `HotkeysTarget`.
     */
    tabIndex?: number;
}
export declare class Hotkeys extends AbstractPureComponent<IHotkeysProps, {}> {
    static displayName: string;
    static defaultProps: {
        tabIndex: number;
    };
    render(): JSX.Element;
    protected validateProps(props: IHotkeysProps & {
        children: React.ReactNode;
    }): void;
}
