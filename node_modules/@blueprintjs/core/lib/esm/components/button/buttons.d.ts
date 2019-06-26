/// <reference types="react" />
import * as React from "react";
import { AbstractButton, IButtonProps } from "./abstractButton";
export { IButtonProps };
export declare class Button extends AbstractButton<React.ButtonHTMLAttributes<HTMLButtonElement>> {
    static displayName: string;
    render(): JSX.Element;
}
export declare class AnchorButton extends AbstractButton<React.AnchorHTMLAttributes<HTMLAnchorElement>> {
    static displayName: string;
    render(): JSX.Element;
}
