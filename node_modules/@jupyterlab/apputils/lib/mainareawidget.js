"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
const widgets_1 = require("@phosphor/widgets");
const spinner_1 = require("./spinner");
const toolbar_1 = require("./toolbar");
/**
 * A widget meant to be contained in the JupyterLab main area.
 *
 * #### Notes
 * Mirrors all of the `title` attributes of the content.
 * This widget is `closable` by default.
 * This widget is automatically disposed when closed.
 * This widget ensures its own focus when activated.
 */
class MainAreaWidget extends widgets_1.Widget {
    /**
     * Construct a new main area widget.
     *
     * @param options - The options for initializing the widget.
     */
    constructor(options) {
        super(options);
        this._changeGuard = false;
        this._spinner = new spinner_1.Spinner();
        this._isRevealed = false;
        this.addClass('jp-MainAreaWidget');
        this.id = coreutils_1.UUID.uuid4();
        const content = (this._content = options.content);
        const toolbar = (this._toolbar = options.toolbar || new toolbar_1.Toolbar());
        const spinner = this._spinner;
        const layout = (this.layout = new widgets_1.BoxLayout({ spacing: 0 }));
        layout.direction = 'top-to-bottom';
        widgets_1.BoxLayout.setStretch(toolbar, 0);
        widgets_1.BoxLayout.setStretch(content, 1);
        layout.addWidget(toolbar);
        layout.addWidget(content);
        if (!content.id) {
            content.id = coreutils_1.UUID.uuid4();
        }
        content.node.tabIndex = -1;
        this._updateTitle();
        content.title.changed.connect(this._updateTitle, this);
        this.title.closable = true;
        this.title.changed.connect(this._updateContentTitle, this);
        if (options.reveal) {
            this.node.appendChild(spinner.node);
            this._revealed = options.reveal
                .then(() => {
                if (content.isDisposed) {
                    this.dispose();
                    return;
                }
                content.disposed.connect(() => this.dispose());
                const active = document.activeElement === spinner.node;
                this.node.removeChild(spinner.node);
                spinner.dispose();
                this._isRevealed = true;
                if (active) {
                    this._focusContent();
                }
            })
                .catch(e => {
                // Show a revealed promise error.
                const error = new widgets_1.Widget();
                // Show the error to the user.
                const pre = document.createElement('pre');
                pre.textContent = String(e);
                error.node.appendChild(pre);
                widgets_1.BoxLayout.setStretch(error, 1);
                this.node.removeChild(spinner.node);
                spinner.dispose();
                content.dispose();
                this._content = null;
                toolbar.dispose();
                this._toolbar = null;
                layout.addWidget(error);
                this._isRevealed = true;
                throw error;
            });
        }
        else {
            // Handle no reveal promise.
            spinner.dispose();
            content.disposed.connect(() => this.dispose());
            this._isRevealed = true;
            this._revealed = Promise.resolve(undefined);
        }
    }
    /**
     * The content hosted by the widget.
     */
    get content() {
        return this._content;
    }
    /**
     * The toolbar hosted by the widget.
     */
    get toolbar() {
        return this._toolbar;
    }
    /**
     * Whether the content widget or an error is revealed.
     */
    get isRevealed() {
        return this._isRevealed;
    }
    /**
     * A promise that resolves when the widget is revealed.
     */
    get revealed() {
        return this._revealed;
    }
    /**
     * Handle `'activate-request'` messages.
     */
    onActivateRequest(msg) {
        if (this._isRevealed) {
            if (this._content) {
                this._focusContent();
            }
        }
        else {
            this._spinner.node.focus();
        }
    }
    /**
     * Handle `'close-request'` messages.
     */
    onCloseRequest(msg) {
        this.dispose();
    }
    /**
     * Update the title based on the attributes of the child widget.
     */
    _updateTitle() {
        if (this._changeGuard) {
            return;
        }
        this._changeGuard = true;
        const content = this.content;
        this.title.label = content.title.label;
        this.title.mnemonic = content.title.mnemonic;
        this.title.iconClass = content.title.iconClass;
        this.title.iconLabel = content.title.iconLabel;
        this.title.caption = content.title.caption;
        this.title.className = content.title.className;
        this.title.dataset = content.title.dataset;
        this._changeGuard = false;
    }
    /**
     * Update the content title based on attributes of the main widget.
     */
    _updateContentTitle() {
        if (this._changeGuard) {
            return;
        }
        this._changeGuard = true;
        const content = this.content;
        content.title.label = this.title.label;
        content.title.mnemonic = this.title.mnemonic;
        content.title.iconClass = this.title.iconClass;
        content.title.iconLabel = this.title.iconLabel;
        content.title.caption = this.title.caption;
        content.title.className = this.title.className;
        content.title.dataset = this.title.dataset;
        this._changeGuard = false;
    }
    /**
     * Give focus to the content.
     */
    _focusContent() {
        // Focus the content node if we aren't already focused on it or a
        // descendent.
        if (!this.content.node.contains(document.activeElement)) {
            this.content.node.focus();
        }
        // Activate the content asynchronously (which may change the focus).
        this.content.activate();
    }
}
exports.MainAreaWidget = MainAreaWidget;
