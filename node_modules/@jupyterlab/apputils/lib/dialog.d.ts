import { Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
import * as React from 'react';
/**
 * Create and show a dialog.
 *
 * @param options - The dialog setup options.
 *
 * @returns A promise that resolves with whether the dialog was accepted.
 */
export declare function showDialog<T>(options?: Partial<Dialog.IOptions<T>>): Promise<Dialog.IResult<T>>;
/**
 * Show an error message dialog.
 *
 * @param title - The title of the dialog box.
 *
 * @param error - the error to show in the dialog body (either a string
 *   or an object with a string `message` property).
 */
export declare function showErrorMessage(title: string, error: any): Promise<void>;
/**
 * A modal dialog widget.
 */
export declare class Dialog<T> extends Widget {
    /**
     * Create a dialog panel instance.
     *
     * @param options - The dialog setup options.
     */
    constructor(options?: Partial<Dialog.IOptions<T>>);
    /**
     * Dispose of the resources used by the dialog.
     */
    dispose(): void;
    /**
     * Launch the dialog as a modal window.
     *
     * @returns a promise that resolves with the result of the dialog.
     */
    launch(): Promise<Dialog.IResult<T>>;
    /**
     * Resolve the current dialog.
     *
     * @param index - An optional index to the button to resolve.
     *
     * #### Notes
     * Will default to the defaultIndex.
     * Will resolve the current `show()` with the button value.
     * Will be a no-op if the dialog is not shown.
     */
    resolve(index?: number): void;
    /**
     * Reject the current dialog with a default reject value.
     *
     * #### Notes
     * Will be a no-op if the dialog is not shown.
     */
    reject(): void;
    /**
     * Handle the DOM events for the directory listing.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the panel's DOM node. It should
     * not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     *  A message handler invoked on an `'after-attach'` message.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     *  A message handler invoked on an `'after-detach'` message.
     */
    protected onAfterDetach(msg: Message): void;
    /**
     * A message handler invoked on a `'close-request'` message.
     */
    protected onCloseRequest(msg: Message): void;
    /**
     * Handle the `'click'` event for a dialog button.
     *
     * @param event - The DOM event sent to the widget
     */
    protected _evtClick(event: MouseEvent): void;
    /**
     * Handle the `'keydown'` event for the widget.
     *
     * @param event - The DOM event sent to the widget
     */
    protected _evtKeydown(event: KeyboardEvent): void;
    /**
     * Handle the `'focus'` event for the widget.
     *
     * @param event - The DOM event sent to the widget
     */
    protected _evtFocus(event: FocusEvent): void;
    /**
     * Resolve a button item.
     */
    private _resolve;
    private _buttonNodes;
    private _buttons;
    private _original;
    private _first;
    private _primary;
    private _promise;
    private _defaultButton;
    private _host;
    private _body;
    private _focusNodeSelector;
}
/**
 * The namespace for Dialog class statics.
 */
export declare namespace Dialog {
    /**
     * The options used to create a dialog.
     */
    interface IOptions<T> {
        /**
         * The top level text for the dialog.  Defaults to an empty string.
         */
        title: HeaderType;
        /**
         * The main body element for the dialog or a message to display.
         * Defaults to an empty string.
         *
         * #### Notes
         * If a widget is given as the body, it will be disposed after the
         * dialog is resolved.  If the widget has a `getValue()` method,
         * the method will be called prior to disposal and the value
         * will be provided as part of the dialog result.
         * A string argument will be used as raw `textContent`.
         * All `input` and `select` nodes will be wrapped and styled.
         */
        body: BodyType<T>;
        /**
         * The host element for the dialog. Defaults to `document.body`.
         */
        host: HTMLElement;
        /**
         * The to buttons to display. Defaults to cancel and accept buttons.
         */
        buttons: ReadonlyArray<IButton>;
        /**
         * The index of the default button.  Defaults to the last button.
         */
        defaultButton: number;
        /**
         * A selector for the primary element that should take focus in the dialog.
         * Defaults to an empty string, causing the [[defaultButton]] to take
         * focus.
         */
        focusNodeSelector: string;
        /**
         * An optional renderer for dialog items.  Defaults to a shared
         * default renderer.
         */
        renderer: IRenderer;
    }
    /**
     * The options used to make a button item.
     */
    interface IButton {
        /**
         * The label for the button.
         */
        label: string;
        /**
         * The icon class for the button.
         */
        iconClass: string;
        /**
         * The icon label for the button.
         */
        iconLabel: string;
        /**
         * The caption for the button.
         */
        caption: string;
        /**
         * The extra class name for the button.
         */
        className: string;
        /**
         * The dialog action to perform when the button is clicked.
         */
        accept: boolean;
        /**
         * The button display type.
         */
        displayType: 'default' | 'warn';
    }
    /**
     * The options used to create a button.
     */
    type ButtonOptions = Partial<IButton>;
    /**
     * The header input types.
     */
    type HeaderType = React.ReactElement<any> | string;
    /**
     * The result of a dialog.
     */
    interface IResult<T> {
        /**
         * The button that was pressed.
         */
        button: IButton;
        /**
         * The value retrieved from `.getValue()` if given on the widget.
         */
        value: T | null;
    }
    /**
     * A widget used as a dialog body.
     */
    interface IBodyWidget<T = string> extends Widget {
        /**
         * Get the serialized value of the widget.
         */
        getValue?(): T;
    }
    /**
     * The body input types.
     */
    type BodyType<T> = IBodyWidget<T> | React.ReactElement<any> | string;
    /**
     * Create an accept button.
     */
    function okButton(options?: ButtonOptions): Readonly<IButton>;
    /**
     * Create a reject button.
     */
    function cancelButton(options?: ButtonOptions): Readonly<IButton>;
    /**
     * Create a warn button.
     */
    function warnButton(options?: ButtonOptions): Readonly<IButton>;
    /**
     * Create a button item.
     */
    function createButton(value: Dialog.ButtonOptions): Readonly<IButton>;
    /**
     * A dialog renderer.
     */
    interface IRenderer {
        /**
         * Create the header of the dialog.
         *
         * @param title - The title of the dialog.
         *
         * @returns A widget for the dialog header.
         */
        createHeader(title: HeaderType): Widget;
        /**
         * Create the body of the dialog.
         *
         * @param value - The input value for the body.
         *
         * @returns A widget for the body.
         */
        createBody(body: BodyType<any>): Widget;
        /**
         * Create the footer of the dialog.
         *
         * @param buttons - The button nodes to add to the footer.
         *
         * @returns A widget for the footer.
         */
        createFooter(buttons: ReadonlyArray<HTMLElement>): Widget;
        /**
         * Create a button node for the dialog.
         *
         * @param button - The button data.
         *
         * @returns A node for the button.
         */
        createButtonNode(button: IButton): HTMLElement;
    }
    /**
     * The default implementation of a dialog renderer.
     */
    class Renderer {
        /**
         * Create the header of the dialog.
         *
         * @param title - The title of the dialog.
         *
         * @returns A widget for the dialog header.
         */
        createHeader(title: HeaderType): Widget;
        /**
         * Create the body of the dialog.
         *
         * @param value - The input value for the body.
         *
         * @returns A widget for the body.
         */
        createBody(value: BodyType<any>): Widget;
        /**
         * Create the footer of the dialog.
         *
         * @param buttonNodes - The buttons nodes to add to the footer.
         *
         * @returns A widget for the footer.
         */
        createFooter(buttons: ReadonlyArray<HTMLElement>): Widget;
        /**
         * Create a button node for the dialog.
         *
         * @param button - The button data.
         *
         * @returns A node for the button.
         */
        createButtonNode(button: IButton): HTMLElement;
        /**
         * Create the class name for the button.
         *
         * @param data - The data to use for the class name.
         *
         * @returns The full class name for the button.
         */
        createItemClass(data: IButton): string;
        /**
         * Render an icon element for a dialog item.
         *
         * @param data - The data to use for rendering the icon.
         *
         * @returns An HTML element representing the icon.
         */
        renderIcon(data: IButton): HTMLElement;
        /**
         * Create the class name for the button icon.
         *
         * @param data - The data to use for the class name.
         *
         * @returns The full class name for the item icon.
         */
        createIconClass(data: IButton): string;
        /**
         * Render the label element for a button.
         *
         * @param data - The data to use for rendering the label.
         *
         * @returns An HTML element representing the item label.
         */
        renderLabel(data: IButton): HTMLElement;
    }
    /**
     * The default renderer instance.
     */
    const defaultRenderer: Renderer;
}
