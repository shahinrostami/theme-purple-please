import { ReactElementWidget } from './vdom';
import { IIterator } from '@phosphor/algorithm';
import { CommandRegistry } from '@phosphor/commands';
import { Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
import { IClientSession } from './clientsession';
import * as React from 'react';
/**
 * A class which provides a toolbar widget.
 */
export declare class Toolbar<T extends Widget = Widget> extends Widget {
    /**
     * Construct a new toolbar widget.
     */
    constructor();
    /**
     * Get an iterator over the ordered toolbar item names.
     *
     * @returns An iterator over the toolbar item names.
     */
    names(): IIterator<string>;
    /**
     * Add an item to the end of the toolbar.
     *
     * @param name - The name of the widget to add to the toolbar.
     *
     * @param widget - The widget to add to the toolbar.
     *
     * @param index - The optional name of the item to insert after.
     *
     * @returns Whether the item was added to toolbar.  Returns false if
     *   an item of the same name is already in the toolbar.
     *
     * #### Notes
     * The item can be removed from the toolbar by setting its parent to `null`.
     */
    addItem(name: string, widget: T): boolean;
    /**
     * Insert an item into the toolbar at the specified index.
     *
     * @param index - The index at which to insert the item.
     *
     * @param name - The name of the item.
     *
     * @param widget - The widget to add.
     *
     * @returns Whether the item was added to the toolbar. Returns false if
     *   an item of the same name is already in the toolbar.
     *
     * #### Notes
     * The index will be clamped to the bounds of the items.
     * The item can be removed from the toolbar by setting its parent to `null`.
     */
    insertItem(index: number, name: string, widget: T): boolean;
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the dock panel's node. It should
     * not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * Handle `after-attach` messages for the widget.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `before-detach` messages for the widget.
     */
    protected onBeforeDetach(msg: Message): void;
}
/**
 * The namespace for Toolbar class statics.
 */
export declare namespace Toolbar {
    /**
     * Create an interrupt toolbar item.
     */
    function createInterruptButton(session: IClientSession): ToolbarButton;
    /**
     * Create a restart toolbar item.
     */
    function createRestartButton(session: IClientSession): ToolbarButton;
    /**
     * Create a toolbar spacer item.
     *
     * #### Notes
     * It is a flex spacer that separates the left toolbar items
     * from the right toolbar items.
     */
    function createSpacerItem(): Widget;
    /**
     * Create a kernel name indicator item.
     *
     * #### Notes
     * It will display the `'display_name`' of the current kernel,
     * or `'No Kernel!'` if there is no kernel.
     * It can handle a change in context or kernel.
     */
    function createKernelNameItem(session: IClientSession): ToolbarButton;
    /**
     * Create a kernel status indicator item.
     *
     * #### Notes
     * It show display a busy status if the kernel status is
     * not idle.
     * It will show the current status in the node title.
     * It can handle a change to the context or the kernel.
     */
    function createKernelStatusItem(session: IClientSession): Widget;
}
/**
 * Namespace for ToolbarButtonComponent.
 */
export declare namespace ToolbarButtonComponent {
    /**
     * Interface for ToolbarButttonComponent props.
     */
    interface IProps {
        className?: string;
        label?: string;
        iconClassName?: string;
        iconLabel?: string;
        tooltip?: string;
        onClick?: () => void;
        enabled?: boolean;
    }
}
/**
 * React component for a toolbar button.
 *
 * @param props - The props for ToolbarButtonComponent.
 */
export declare function ToolbarButtonComponent(props: ToolbarButtonComponent.IProps): JSX.Element;
/**
 * Phosphor Widget version of ToolbarButtonComponent.
 */
export declare class ToolbarButton extends ReactElementWidget {
    /**
     * Create a ToolbarButton.
     *
     * @param props - Props for ToolbarButtonComponent.
     */
    constructor(props?: ToolbarButtonComponent.IProps);
}
/**
 * Namespace for CommandToolbarButtonComponent.
 */
export declare namespace CommandToolbarButtonComponent {
    /**
     * Interface for CommandToolbarButtonComponent props.
     */
    interface IProps {
        commands: CommandRegistry;
        id: string;
    }
}
/**
 * React component for a toolbar button that wraps a command.
 *
 * This wraps the ToolbarButtonComponent and watches the command registry
 * for changes to the command.
 */
export declare class CommandToolbarButtonComponent extends React.Component<CommandToolbarButtonComponent.IProps> {
    constructor(props: CommandToolbarButtonComponent.IProps);
    render(): JSX.Element;
    private _onChange;
    private _childProps;
}
/**
 * Phosphor Widget version of ToolbarButtonComponent.
 */
export declare class CommandToolbarButton extends ReactElementWidget {
    constructor(props: CommandToolbarButtonComponent.IProps);
}
