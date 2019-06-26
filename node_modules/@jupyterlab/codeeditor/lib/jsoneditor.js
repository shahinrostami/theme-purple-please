"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
const widgets_1 = require("@phosphor/widgets");
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
const editor_1 = require("./editor");
/**
 * The class name added to a JSONEditor instance.
 */
const JSONEDITOR_CLASS = 'jp-JSONEditor';
/**
 * The class name added when the Metadata editor contains invalid JSON.
 */
const ERROR_CLASS = 'jp-mod-error';
/**
 * The class name added to the editor host node.
 */
const HOST_CLASS = 'jp-JSONEditor-host';
/**
 * The class name added to the header area.
 */
const HEADER_CLASS = 'jp-JSONEditor-header';
/**
 * The class name added to the title node.
 */
const TITLE_CLASS = 'jp-JSONEditor-title';
/**
 * The class name added to the collapser node.
 */
const COLLAPSER_CLASS = 'jp-JSONEditor-collapser';
/**
 * The class name added to the collapser node that is enabled.
 */
const COLLAPSE_ENABLED_CLASS = 'jp-mod-collapse-enabled';
/**
 * The class name added to the revert button.
 */
const REVERT_CLASS = 'jp-JSONEditor-revertButton';
/**
 * The class name added to the commit button.
 */
const COMMIT_CLASS = 'jp-JSONEditor-commitButton';
/**
 * The class name added to collapsed items.
 */
const COLLAPSED_CLASS = 'jp-mod-collapsed';
/**
 * A widget for editing observable JSON.
 */
class JSONEditor extends widgets_1.Widget {
    /**
     * Construct a new JSON editor.
     */
    constructor(options) {
        super();
        this._dataDirty = false;
        this._inputDirty = false;
        this._source = null;
        this._originalValue = coreutils_1.JSONExt.emptyObject;
        this._changeGuard = false;
        this.addClass(JSONEDITOR_CLASS);
        ReactDOM.render(Private.createEditorContent(options), this.node);
        let host = this.editorHostNode;
        let model = new editor_1.CodeEditor.Model();
        model.value.text = 'No data!';
        model.mimeType = 'application/json';
        model.value.changed.connect(this._onValueChanged, this);
        this.model = model;
        this.editor = options.editorFactory({ host, model });
        this.editor.setOption('readOnly', true);
        this.collapsible = !!options.collapsible;
    }
    /**
     * The title of the editor.
     */
    get editorTitle() {
        return this.titleNode.textContent || '';
    }
    set editorTitle(value) {
        this.titleNode.textContent = value;
    }
    /**
     * Get the editor host node used by the JSON editor.
     */
    get editorHostNode() {
        return this.node.getElementsByClassName(HOST_CLASS)[0];
    }
    /**
     * Get the header node used by the JSON editor.
     */
    get headerNode() {
        return this.node.getElementsByClassName(HEADER_CLASS)[0];
    }
    /**
     * Get the title node used by the JSON editor.
     */
    get titleNode() {
        return this.node.getElementsByClassName(TITLE_CLASS)[0];
    }
    /**
     * Get the collapser node used by the JSON editor.
     */
    get collapserNode() {
        return this.node.getElementsByClassName(COLLAPSER_CLASS)[0];
    }
    /**
     * Get the revert button used by the JSON editor.
     */
    get revertButtonNode() {
        return this.node.getElementsByClassName(REVERT_CLASS)[0];
    }
    /**
     * Get the commit button used by the JSON editor.
     */
    get commitButtonNode() {
        return this.node.getElementsByClassName(COMMIT_CLASS)[0];
    }
    /**
     * The observable source.
     */
    get source() {
        return this._source;
    }
    set source(value) {
        if (this._source === value) {
            return;
        }
        if (this._source) {
            this._source.changed.disconnect(this._onSourceChanged, this);
        }
        this._source = value;
        this.editor.setOption('readOnly', value === null);
        if (value) {
            value.changed.connect(this._onSourceChanged, this);
        }
        this._setValue();
    }
    /**
     * Get whether the editor is dirty.
     */
    get isDirty() {
        return this._dataDirty || this._inputDirty;
    }
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the notebook panel's node. It should
     * not be called directly by user code.
     */
    handleEvent(event) {
        switch (event.type) {
            case 'blur':
                this._evtBlur(event);
                break;
            case 'click':
                this._evtClick(event);
                break;
            default:
                break;
        }
    }
    /**
     * Handle `after-attach` messages for the widget.
     */
    onAfterAttach(msg) {
        let node = this.editorHostNode;
        node.addEventListener('blur', this, true);
        node.addEventListener('click', this, true);
        this.revertButtonNode.hidden = true;
        this.commitButtonNode.hidden = true;
        this.headerNode.addEventListener('click', this);
        if (this.isVisible) {
            this.update();
        }
    }
    /**
     * Handle `after-show` messages for the widget.
     */
    onAfterShow(msg) {
        this.update();
    }
    /**
     * Handle `update-request` messages for the widget.
     */
    onUpdateRequest(msg) {
        this.editor.refresh();
    }
    /**
     * Handle `before-detach` messages for the widget.
     */
    onBeforeDetach(msg) {
        let node = this.editorHostNode;
        node.removeEventListener('blur', this, true);
        node.removeEventListener('click', this, true);
        this.headerNode.removeEventListener('click', this);
    }
    /**
     * Handle a change to the metadata of the source.
     */
    _onSourceChanged(sender, args) {
        if (this._changeGuard) {
            return;
        }
        if (this._inputDirty || this.editor.hasFocus()) {
            this._dataDirty = true;
            return;
        }
        this._setValue();
    }
    /**
     * Handle change events.
     */
    _onValueChanged() {
        let valid = true;
        try {
            let value = JSON.parse(this.editor.model.value.text);
            this.removeClass(ERROR_CLASS);
            this._inputDirty =
                !this._changeGuard && !coreutils_1.JSONExt.deepEqual(value, this._originalValue);
        }
        catch (err) {
            this.addClass(ERROR_CLASS);
            this._inputDirty = true;
            valid = false;
        }
        this.revertButtonNode.hidden = !this._inputDirty;
        this.commitButtonNode.hidden = !valid || !this._inputDirty;
    }
    /**
     * Handle blur events for the text area.
     */
    _evtBlur(event) {
        // Update the metadata if necessary.
        if (!this._inputDirty && this._dataDirty) {
            this._setValue();
        }
    }
    /**
     * Handle click events for the buttons.
     */
    _evtClick(event) {
        let target = event.target;
        switch (target) {
            case this.revertButtonNode:
                this._setValue();
                break;
            case this.commitButtonNode:
                if (!this.commitButtonNode.hidden && !this.hasClass(ERROR_CLASS)) {
                    this._changeGuard = true;
                    this._mergeContent();
                    this._changeGuard = false;
                    this._setValue();
                }
                break;
            case this.titleNode:
            case this.collapserNode:
                if (this.collapsible) {
                    let collapser = this.collapserNode;
                    if (collapser.classList.contains(COLLAPSED_CLASS)) {
                        collapser.classList.remove(COLLAPSED_CLASS);
                        this.editorHostNode.classList.remove(COLLAPSED_CLASS);
                    }
                    else {
                        collapser.classList.add(COLLAPSED_CLASS);
                        this.editorHostNode.classList.add(COLLAPSED_CLASS);
                    }
                }
                break;
            case this.editorHostNode:
                this.editor.focus();
                break;
            default:
                break;
        }
    }
    /**
     * Merge the user content.
     */
    _mergeContent() {
        let model = this.editor.model;
        let current = this._source ? this._source.toJSON() : {};
        let old = this._originalValue;
        let user = JSON.parse(model.value.text);
        let source = this.source;
        if (!source) {
            return;
        }
        // If it is in user and has changed from old, set in current.
        for (let key in user) {
            if (!coreutils_1.JSONExt.deepEqual(user[key], old[key] || null)) {
                current[key] = user[key];
            }
        }
        // If it was in old and is not in user, remove from current.
        for (let key in old) {
            if (!(key in user)) {
                delete current[key];
                source.delete(key);
            }
        }
        // Set the values.
        for (let key in current) {
            source.set(key, current[key]);
        }
    }
    /**
     * Set the value given the owner contents.
     */
    _setValue() {
        this._dataDirty = false;
        this._inputDirty = false;
        this.revertButtonNode.hidden = true;
        this.commitButtonNode.hidden = true;
        this.removeClass(ERROR_CLASS);
        let model = this.editor.model;
        let content = this._source ? this._source.toJSON() : {};
        this._changeGuard = true;
        if (content === void 0) {
            model.value.text = 'No data!';
            this._originalValue = coreutils_1.JSONExt.emptyObject;
        }
        else {
            let value = JSON.stringify(content, null, 4);
            model.value.text = value;
            this._originalValue = content;
            // Move the cursor to within the brace.
            if (value.length > 1 && value[0] === '{') {
                this.editor.setCursorPosition({ line: 0, column: 1 });
            }
        }
        this.editor.refresh();
        this._changeGuard = false;
        this.commitButtonNode.hidden = true;
        this.revertButtonNode.hidden = true;
    }
}
exports.JSONEditor = JSONEditor;
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * Create the JSON Editor node's content.
     */
    function createEditorContent(options) {
        const revertTitle = 'Revert changes to data';
        const confirmTitle = 'Commit changes to data';
        const title = options.title || '';
        const collapseClass = options.collapsible
            ? `${COLLAPSER_CLASS} ${COLLAPSE_ENABLED_CLASS}`
            : COLLAPSER_CLASS;
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: HEADER_CLASS },
                React.createElement("span", { className: TITLE_CLASS }, title),
                React.createElement("span", { className: collapseClass }),
                React.createElement("span", { className: REVERT_CLASS, title: revertTitle }),
                React.createElement("span", { className: COMMIT_CLASS, title: confirmTitle })),
            React.createElement("div", { className: HOST_CLASS })));
    }
    Private.createEditorContent = createEditorContent;
})(Private || (Private = {}));
