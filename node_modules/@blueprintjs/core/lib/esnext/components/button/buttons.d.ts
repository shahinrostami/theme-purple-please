/// <reference types="react" />
import { IRef } from "../../common/refs";
import { AbstractButton, IButtonProps, IAnchorButtonProps, ButtonProps, AnchorButtonProps } from "./abstractButton";
export { IAnchorButtonProps, IButtonProps, ButtonProps, AnchorButtonProps };
export declare class Button extends AbstractButton<HTMLButtonElement> {
    static displayName: string;
    buttonRef: HTMLButtonElement | null;
    protected handleRef: IRef<HTMLButtonElement>;
    render(): JSX.Element;
    componentDidUpdate(prevProps: ButtonProps): void;
}
export declare class AnchorButton extends AbstractButton<HTMLAnchorElement> {
    static displayName: string;
    buttonRef: HTMLAnchorElement | null;
    protected handleRef: IRef<HTMLAnchorElement>;
    render(): JSX.Element;
    componentDidUpdate(prevProps: AnchorButtonProps): void;
}
