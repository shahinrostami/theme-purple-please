"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const algorithm_1 = require("@phosphor/algorithm");
const coreutils_1 = require("@phosphor/coreutils");
const messaging_1 = require("@phosphor/messaging");
const widgets_1 = require("@phosphor/widgets");
const vdom_1 = require("./vdom");
const styling_1 = require("./styling");
/**
 * Create and show a dialog.
 *
 * @param options - The dialog setup options.
 *
 * @returns A promise that resolves with whether the dialog was accepted.
 */
function showDialog(options = {}) {
    let dialog = new Dialog(options);
    return dialog.launch();
}
exports.showDialog = showDialog;
/**
 * Show an error message dialog.
 *
 * @param title - The title of the dialog box.
 *
 * @param error - the error to show in the dialog body (either a string
 *   or an object with a string `message` property).
 */
function showErrorMessage(title, error) {
    console.warn('Showing error:', error);
    return showDialog({
        title: title,
        body: error.message || title,
        buttons: [Dialog.okButton({ label: 'DISMISS' })]
    }).then(() => {
        /* no-op */
    });
}
exports.showErrorMessage = showErrorMessage;
/**
 * A modal dialog widget.
 */
class Dialog extends widgets_1.Widget {
    /**
     * Create a dialog panel instance.
     *
     * @param options - The dialog setup options.
     */
    constructor(options = {}) {
        super();
        this._focusNodeSelector = '';
        this.addClass('jp-Dialog');
        let normalized = Private.handleOptions(options);
        let renderer = normalized.renderer;
        this._host = normalized.host;
        this._defaultButton = normalized.defaultButton;
        this._buttons = normalized.buttons;
        this._buttonNodes = algorithm_1.toArray(algorithm_1.map(this._buttons, button => {
            return renderer.createButtonNode(button);
        }));
        let layout = (this.layout = new widgets_1.PanelLayout());
        let content = new widgets_1.Panel();
        content.addClass('jp-Dialog-content');
        layout.addWidget(content);
        this._body = normalized.body;
        let header = renderer.createHeader(normalized.title);
        let body = renderer.createBody(normalized.body);
        let footer = renderer.createFooter(this._buttonNodes);
        content.addWidget(header);
        content.addWidget(body);
        content.addWidget(footer);
        this._primary = this._buttonNodes[this._defaultButton];
        this._focusNodeSelector = options.focusNodeSelector;
    }
    /**
     * Dispose of the resources used by the dialog.
     */
    dispose() {
        const promise = this._promise;
        if (promise) {
            this._promise = null;
            promise.reject(void 0);
            algorithm_1.ArrayExt.removeFirstOf(Private.launchQueue, promise.promise);
        }
        super.dispose();
    }
    /**
     * Launch the dialog as a modal window.
     *
     * @returns a promise that resolves with the result of the dialog.
     */
    launch() {
        // Return the existing dialog if already open.
        if (this._promise) {
            return this._promise.promise;
        }
        const promise = (this._promise = new coreutils_1.PromiseDelegate());
        let promises = Promise.all(Private.launchQueue);
        Private.launchQueue.push(this._promise.promise);
        return promises.then(() => {
            widgets_1.Widget.attach(this, this._host);
            return promise.promise;
        });
    }
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
    resolve(index) {
        if (!this._promise) {
            return;
        }
        if (index === undefined) {
            index = this._defaultButton;
        }
        this._resolve(this._buttons[index]);
    }
    /**
     * Reject the current dialog with a default reject value.
     *
     * #### Notes
     * Will be a no-op if the dialog is not shown.
     */
    reject() {
        if (!this._promise) {
            return;
        }
        this._resolve(Dialog.cancelButton());
    }
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
    handleEvent(event) {
        switch (event.type) {
            case 'keydown':
                this._evtKeydown(event);
                break;
            case 'click':
                this._evtClick(event);
                break;
            case 'focus':
                this._evtFocus(event);
                break;
            case 'contextmenu':
                event.preventDefault();
                event.stopPropagation();
                break;
            default:
                break;
        }
    }
    /**
     *  A message handler invoked on an `'after-attach'` message.
     */
    onAfterAttach(msg) {
        let node = this.node;
        node.addEventListener('keydown', this, true);
        node.addEventListener('contextmenu', this, true);
        node.addEventListener('click', this, true);
        document.addEventListener('focus', this, true);
        this._first = Private.findFirstFocusable(this.node);
        this._original = document.activeElement;
        if (this._focusNodeSelector) {
            let body = this.node.querySelector('.jp-Dialog-body');
            let el = body.querySelector(this._focusNodeSelector);
            if (el) {
                this._primary = el;
            }
        }
        this._primary.focus();
    }
    /**
     *  A message handler invoked on an `'after-detach'` message.
     */
    onAfterDetach(msg) {
        let node = this.node;
        node.removeEventListener('keydown', this, true);
        node.removeEventListener('contextmenu', this, true);
        node.removeEventListener('click', this, true);
        document.removeEventListener('focus', this, true);
        this._original.focus();
    }
    /**
     * A message handler invoked on a `'close-request'` message.
     */
    onCloseRequest(msg) {
        if (this._promise) {
            this.reject();
        }
        super.onCloseRequest(msg);
    }
    /**
     * Handle the `'click'` event for a dialog button.
     *
     * @param event - The DOM event sent to the widget
     */
    _evtClick(event) {
        let content = this.node.getElementsByClassName('jp-Dialog-content')[0];
        if (!content.contains(event.target)) {
            event.stopPropagation();
            event.preventDefault();
            return;
        }
        for (let buttonNode of this._buttonNodes) {
            if (buttonNode.contains(event.target)) {
                let index = this._buttonNodes.indexOf(buttonNode);
                this.resolve(index);
            }
        }
    }
    /**
     * Handle the `'keydown'` event for the widget.
     *
     * @param event - The DOM event sent to the widget
     */
    _evtKeydown(event) {
        // Check for escape key
        switch (event.keyCode) {
            case 27: // Escape.
                event.stopPropagation();
                event.preventDefault();
                this.reject();
                break;
            case 9: // Tab.
                // Handle a tab on the last button.
                let node = this._buttonNodes[this._buttons.length - 1];
                if (document.activeElement === node && !event.shiftKey) {
                    event.stopPropagation();
                    event.preventDefault();
                    this._first.focus();
                }
                break;
            case 13: // Enter.
                event.stopPropagation();
                event.preventDefault();
                this.resolve();
                break;
            default:
                break;
        }
    }
    /**
     * Handle the `'focus'` event for the widget.
     *
     * @param event - The DOM event sent to the widget
     */
    _evtFocus(event) {
        let target = event.target;
        if (!this.node.contains(target)) {
            event.stopPropagation();
            this._buttonNodes[this._defaultButton].focus();
        }
    }
    /**
     * Resolve a button item.
     */
    _resolve(button) {
        // Prevent loopback.
        const promise = this._promise;
        if (!promise) {
            this.dispose();
            return;
        }
        this._promise = null;
        algorithm_1.ArrayExt.removeFirstOf(Private.launchQueue, promise.promise);
        let body = this._body;
        let value = null;
        if (button.accept &&
            body instanceof widgets_1.Widget &&
            typeof body.getValue === 'function') {
            value = body.getValue();
        }
        this.dispose();
        promise.resolve({ button, value });
    }
}
exports.Dialog = Dialog;
/**
 * The namespace for Dialog class statics.
 */
(function (Dialog) {
    /**
     * Create an accept button.
     */
    function okButton(options = {}) {
        options.accept = true;
        return createButton(options);
    }
    Dialog.okButton = okButton;
    /**
     * Create a reject button.
     */
    function cancelButton(options = {}) {
        options.accept = false;
        return createButton(options);
    }
    Dialog.cancelButton = cancelButton;
    /**
     * Create a warn button.
     */
    function warnButton(options = {}) {
        options.displayType = 'warn';
        return createButton(options);
    }
    Dialog.warnButton = warnButton;
    /**
     * Create a button item.
     */
    function createButton(value) {
        value.accept = value.accept !== false;
        let defaultLabel = value.accept ? 'OK' : 'CANCEL';
        return {
            label: value.label || defaultLabel,
            iconClass: value.iconClass || '',
            iconLabel: value.iconLabel || '',
            caption: value.caption || '',
            className: value.className || '',
            accept: value.accept,
            displayType: value.displayType || 'default'
        };
    }
    Dialog.createButton = createButton;
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
        createHeader(title) {
            let header;
            if (typeof title === 'string') {
                header = new widgets_1.Widget({ node: document.createElement('span') });
                header.node.textContent = title;
            }
            else {
                header = new vdom_1.ReactElementWidget(title);
            }
            header.addClass('jp-Dialog-header');
            styling_1.Styling.styleNode(header.node);
            return header;
        }
        /**
         * Create the body of the dialog.
         *
         * @param value - The input value for the body.
         *
         * @returns A widget for the body.
         */
        createBody(value) {
            let body;
            if (typeof value === 'string') {
                body = new widgets_1.Widget({ node: document.createElement('span') });
                body.node.textContent = value;
            }
            else if (value instanceof widgets_1.Widget) {
                body = value;
            }
            else {
                body = new vdom_1.ReactElementWidget(value);
                // Immediately update the body even though it has not yet attached in
                // order to trigger a render of the DOM nodes from the React element.
                messaging_1.MessageLoop.sendMessage(body, widgets_1.Widget.Msg.UpdateRequest);
            }
            body.addClass('jp-Dialog-body');
            styling_1.Styling.styleNode(body.node);
            return body;
        }
        /**
         * Create the footer of the dialog.
         *
         * @param buttonNodes - The buttons nodes to add to the footer.
         *
         * @returns A widget for the footer.
         */
        createFooter(buttons) {
            let footer = new widgets_1.Widget();
            footer.addClass('jp-Dialog-footer');
            algorithm_1.each(buttons, button => {
                footer.node.appendChild(button);
            });
            styling_1.Styling.styleNode(footer.node);
            return footer;
        }
        /**
         * Create a button node for the dialog.
         *
         * @param button - The button data.
         *
         * @returns A node for the button.
         */
        createButtonNode(button) {
            const e = document.createElement('button');
            e.className = this.createItemClass(button);
            e.appendChild(this.renderIcon(button));
            e.appendChild(this.renderLabel(button));
            return e;
        }
        /**
         * Create the class name for the button.
         *
         * @param data - The data to use for the class name.
         *
         * @returns The full class name for the button.
         */
        createItemClass(data) {
            // Setup the initial class name.
            let name = 'jp-Dialog-button';
            // Add the other state classes.
            if (data.accept) {
                name += ' jp-mod-accept';
            }
            else {
                name += ' jp-mod-reject';
            }
            if (data.displayType === 'warn') {
                name += ' jp-mod-warn';
            }
            // Add the extra class.
            let extra = data.className;
            if (extra) {
                name += ` ${extra}`;
            }
            // Return the complete class name.
            return name;
        }
        /**
         * Render an icon element for a dialog item.
         *
         * @param data - The data to use for rendering the icon.
         *
         * @returns An HTML element representing the icon.
         */
        renderIcon(data) {
            const e = document.createElement('div');
            e.className = this.createIconClass(data);
            e.appendChild(document.createTextNode(data.iconLabel));
            return e;
        }
        /**
         * Create the class name for the button icon.
         *
         * @param data - The data to use for the class name.
         *
         * @returns The full class name for the item icon.
         */
        createIconClass(data) {
            let name = 'jp-Dialog-buttonIcon';
            let extra = data.iconClass;
            return extra ? `${name} ${extra}` : name;
        }
        /**
         * Render the label element for a button.
         *
         * @param data - The data to use for rendering the label.
         *
         * @returns An HTML element representing the item label.
         */
        renderLabel(data) {
            const e = document.createElement('div');
            e.className = 'jp-Dialog-buttonLabel';
            e.title = data.caption;
            e.appendChild(document.createTextNode(data.label));
            return e;
        }
    }
    Dialog.Renderer = Renderer;
    /**
     * The default renderer instance.
     */
    Dialog.defaultRenderer = new Renderer();
})(Dialog = exports.Dialog || (exports.Dialog = {}));
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * The queue for launching dialogs.
     */
    Private.launchQueue = [];
    /**
     * Handle the input options for a dialog.
     *
     * @param options - The input options.
     *
     * @returns A new options object with defaults applied.
     */
    function handleOptions(options = {}) {
        let buttons = options.buttons || [Dialog.cancelButton(), Dialog.okButton()];
        let defaultButton = buttons.length - 1;
        if (options.defaultButton !== undefined) {
            defaultButton = options.defaultButton;
        }
        return {
            title: options.title || '',
            body: options.body || '',
            host: options.host || document.body,
            buttons,
            defaultButton,
            renderer: options.renderer || Dialog.defaultRenderer,
            focusNodeSelector: options.focusNodeSelector || ''
        };
    }
    Private.handleOptions = handleOptions;
    /**
     *  Find the first focusable item in the dialog.
     */
    function findFirstFocusable(node) {
        let candidateSelectors = [
            'input',
            'select',
            'a[href]',
            'textarea',
            'button',
            '[tabindex]'
        ].join(',');
        return node.querySelectorAll(candidateSelectors)[0];
    }
    Private.findFirstFocusable = findFirstFocusable;
})(Private || (Private = {}));
