import * as React from "react";
import { AbstractPureComponent2, IRef } from "../../common";
import { Props } from "../../common/props";
import { MenuDivider } from "./menuDivider";
import { MenuItem } from "./menuItem";
export declare type MenuProps = IMenuProps;
/** @deprecated use MenuProps */
export interface IMenuProps extends Props, React.HTMLAttributes<HTMLUListElement> {
    /** Whether the menu items in this menu should use a large appearance. */
    large?: boolean;
    /** Ref handler that receives the HTML `<ul>` element backing this component. */
    ulRef?: IRef<HTMLUListElement>;
}
export declare class Menu extends AbstractPureComponent2<MenuProps> {
    static displayName: string;
    /** @deprecated use MenuDivider */
    static Divider: typeof MenuDivider;
    /** @deprecated use MenuItem*/
    static Item: typeof MenuItem;
    render(): JSX.Element;
}
