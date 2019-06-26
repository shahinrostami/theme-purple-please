/// <reference types="react" />
import * as React from "react";
export interface IElementRefProps<E extends HTMLElement> {
    /** Ref handler to access the instance of the internal HTML element. */
    elementRef?: (ref: E | null) => void;
}
export declare const H1: React.StatelessComponent<React.HTMLProps<HTMLHeadingElement> & IElementRefProps<HTMLHeadingElement>>;
export declare const H2: React.StatelessComponent<React.HTMLProps<HTMLHeadingElement> & IElementRefProps<HTMLHeadingElement>>;
export declare const H3: React.StatelessComponent<React.HTMLProps<HTMLHeadingElement> & IElementRefProps<HTMLHeadingElement>>;
export declare const H4: React.StatelessComponent<React.HTMLProps<HTMLHeadingElement> & IElementRefProps<HTMLHeadingElement>>;
export declare const H5: React.StatelessComponent<React.HTMLProps<HTMLHeadingElement> & IElementRefProps<HTMLHeadingElement>>;
export declare const H6: React.StatelessComponent<React.HTMLProps<HTMLHeadingElement> & IElementRefProps<HTMLHeadingElement>>;
export declare const Blockquote: React.StatelessComponent<React.HTMLProps<HTMLElement> & IElementRefProps<HTMLElement>>;
export declare const Code: React.StatelessComponent<React.HTMLProps<HTMLElement> & IElementRefProps<HTMLElement>>;
export declare const Pre: React.StatelessComponent<React.HTMLProps<HTMLElement> & IElementRefProps<HTMLElement>>;
export declare const Label: React.StatelessComponent<React.HTMLProps<HTMLLabelElement> & IElementRefProps<HTMLLabelElement>>;
export declare const OL: React.StatelessComponent<React.HTMLProps<HTMLOListElement> & IElementRefProps<HTMLOListElement>>;
export declare const UL: React.StatelessComponent<React.HTMLProps<HTMLUListElement> & IElementRefProps<HTMLUListElement>>;
