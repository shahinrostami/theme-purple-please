/// <reference types="react" />
import * as React from "react";
import { ITabProps, TabId } from "./tab";
export interface ITabTitleProps extends ITabProps {
    /** Handler invoked when this tab is clicked. */
    onClick: (id: TabId, event: React.MouseEvent<HTMLElement>) => void;
    /** ID of the parent `Tabs` to which this tab belongs. Used to generate ID for ARIA attributes. */
    parentId: TabId;
    /** Whether the tab is currently selected. */
    selected: boolean;
}
export declare class TabTitle extends React.PureComponent<ITabTitleProps, {}> {
    static displayName: string;
    render(): JSX.Element;
    private handleClick;
}
export declare function generateTabPanelId(parentId: TabId, tabId: TabId): string;
export declare function generateTabTitleId(parentId: TabId, tabId: TabId): string;
