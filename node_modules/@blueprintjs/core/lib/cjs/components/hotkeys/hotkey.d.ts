/// <reference types="react" />
import { AbstractPureComponent2, Props } from "../../common";
import { HotkeyConfig } from "../../hooks";
export declare type IHotkeyProps = Props & HotkeyConfig;
export declare class Hotkey extends AbstractPureComponent2<IHotkeyProps> {
    static displayName: string;
    static defaultProps: {
        allowInInput: boolean;
        disabled: boolean;
        global: boolean;
        preventDefault: boolean;
        stopPropagation: boolean;
    };
    render(): JSX.Element;
    protected validateProps(props: IHotkeyProps): void;
}
