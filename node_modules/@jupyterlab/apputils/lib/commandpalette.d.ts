import { Token } from '@lumino/coreutils';
import { IDisposable } from '@lumino/disposable';
import { Message } from '@lumino/messaging';
import { CommandPalette, Panel } from '@lumino/widgets';
/**
 * The command palette token.
 */
export declare const ICommandPalette: Token<ICommandPalette>;
/**
 * The options for creating a command palette item.
 */
export interface IPaletteItem extends CommandPalette.IItemOptions {
}
/**
 * The interface for a Jupyter Lab command palette.
 */
export interface ICommandPalette {
    /**
     * The placeholder text of the command palette's search input.
     */
    placeholder: string;
    /**
     * Activate the command palette for user input.
     */
    activate(): void;
    /**
     * Add a command item to the command palette.
     *
     * @param options - The options for creating the command item.
     *
     * @returns A disposable that will remove the item from the palette.
     */
    addItem(options: IPaletteItem): IDisposable;
}
/**
 * Wrap the command palette in a modal to make it more usable.
 */
export declare class ModalCommandPalette extends Panel {
    constructor(options: ModalCommandPalette.IOptions);
    get palette(): CommandPalette;
    set palette(value: CommandPalette);
    attach(): void;
    detach(): void;
    /**
     * Hide the modal command palette and reset its search.
     */
    hideAndReset(): void;
    /**
     * Handle incoming events.
     */
    handleEvent(event: Event): void;
    /**
     * Find the element with search icon group.
     */
    protected get searchIconGroup(): HTMLDivElement | undefined;
    /**
     * Create element with search icon group.
     */
    protected createSearchIconGroup(): HTMLDivElement;
    /**
     *  A message handler invoked on an `'after-attach'` message.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     *  A message handler invoked on an `'after-detach'` message.
     */
    protected onAfterDetach(msg: Message): void;
    protected onBeforeHide(msg: Message): void;
    protected onAfterShow(msg: Message): void;
    /**
     * A message handler invoked on an `'activate-request'` message.
     */
    protected onActivateRequest(msg: Message): void;
    /**
     * Handle the `'keydown'` event for the widget.
     */
    protected _evtKeydown(event: KeyboardEvent): void;
    private _commandPalette;
}
export declare namespace ModalCommandPalette {
    interface IOptions {
        commandPalette: CommandPalette;
    }
}
