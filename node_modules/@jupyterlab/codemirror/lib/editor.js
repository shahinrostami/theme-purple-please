"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const codemirror_1 = __importDefault(require("codemirror"));
const coreutils_1 = require("@phosphor/coreutils");
const algorithm_1 = require("@phosphor/algorithm");
const disposable_1 = require("@phosphor/disposable");
const signaling_1 = require("@phosphor/signaling");
const apputils_1 = require("@jupyterlab/apputils");
const codeeditor_1 = require("@jupyterlab/codeeditor");
const coreutils_2 = require("@phosphor/coreutils");
const mode_1 = require("./mode");
require("codemirror/addon/comment/comment.js");
require("codemirror/addon/edit/matchbrackets.js");
require("codemirror/addon/edit/closebrackets.js");
require("codemirror/addon/scroll/scrollpastend.js");
require("codemirror/addon/search/searchcursor");
require("codemirror/addon/search/search");
require("codemirror/addon/search/jump-to-line");
require("codemirror/keymap/emacs.js");
require("codemirror/keymap/sublime.js");
require("codemirror/keymap/vim.js");
/**
 * The class name added to CodeMirrorWidget instances.
 */
const EDITOR_CLASS = 'jp-CodeMirrorEditor';
/**
 * The class name added to read only cell editor widgets.
 */
const READ_ONLY_CLASS = 'jp-mod-readOnly';
/**
 * The class name for the hover box for collaborator cursors.
 */
const COLLABORATOR_CURSOR_CLASS = 'jp-CollaboratorCursor';
/**
 * The class name for the hover box for collaborator cursors.
 */
const COLLABORATOR_HOVER_CLASS = 'jp-CollaboratorCursor-hover';
/**
 * The key code for the up arrow key.
 */
const UP_ARROW = 38;
/**
 * The key code for the down arrow key.
 */
const DOWN_ARROW = 40;
/**
 * The time that a collaborator name hover persists.
 */
const HOVER_TIMEOUT = 1000;
/**
 * CodeMirror editor.
 */
class CodeMirrorEditor {
    /**
     * Construct a CodeMirror editor.
     */
    constructor(options) {
        /**
         * A signal emitted when either the top or bottom edge is requested.
         */
        this.edgeRequested = new signaling_1.Signal(this);
        this.selectionMarkers = {};
        this._keydownHandlers = new Array();
        this._changeGuard = false;
        this._uuid = '';
        this._needsRefresh = false;
        this._isDisposed = false;
        this._lastChange = null;
        this._timer = -1;
        let host = (this.host = options.host);
        host.classList.add(EDITOR_CLASS);
        host.classList.add('jp-Editor');
        host.addEventListener('focus', this, true);
        host.addEventListener('blur', this, true);
        host.addEventListener('scroll', this, true);
        this._uuid = options.uuid || coreutils_2.UUID.uuid4();
        // Handle selection style.
        let style = options.selectionStyle || {};
        this._selectionStyle = Object.assign({}, codeeditor_1.CodeEditor.defaultSelectionStyle, style);
        let model = (this._model = options.model);
        let config = options.config || {};
        let fullConfig = (this._config = Object.assign({}, CodeMirrorEditor.defaultConfig, config));
        let editor = (this._editor = Private.createEditor(host, fullConfig));
        let doc = editor.getDoc();
        // Handle initial values for text, mimetype, and selections.
        doc.setValue(model.value.text);
        this.clearHistory();
        this._onMimeTypeChanged();
        this._onCursorActivity();
        this._timer = window.setInterval(() => {
            this._checkSync();
        }, 3000);
        // Connect to changes.
        model.value.changed.connect(this._onValueChanged, this);
        model.mimeTypeChanged.connect(this._onMimeTypeChanged, this);
        model.selections.changed.connect(this._onSelectionsChanged, this);
        codemirror_1.default.on(editor, 'keydown', (editor, event) => {
            let index = algorithm_1.ArrayExt.findFirstIndex(this._keydownHandlers, handler => {
                if (handler(this, event) === true) {
                    event.preventDefault();
                    return true;
                }
                return false;
            });
            if (index === -1) {
                this.onKeydown(event);
            }
        });
        codemirror_1.default.on(editor, 'cursorActivity', () => this._onCursorActivity());
        codemirror_1.default.on(editor.getDoc(), 'beforeChange', (instance, change) => {
            this._beforeDocChanged(instance, change);
        });
        codemirror_1.default.on(editor.getDoc(), 'change', (instance, change) => {
            // Manually refresh after setValue to make sure editor is properly sized.
            if (change.origin === 'setValue' && this.hasFocus()) {
                this.refresh();
            }
            this._lastChange = change;
        });
        // Manually refresh on paste to make sure editor is properly sized.
        editor.getWrapperElement().addEventListener('paste', () => {
            if (this.hasFocus()) {
                this.refresh();
            }
        });
    }
    /**
     * The uuid of this editor;
     */
    get uuid() {
        return this._uuid;
    }
    set uuid(value) {
        this._uuid = value;
    }
    /**
     * The selection style of this editor.
     */
    get selectionStyle() {
        return this._selectionStyle;
    }
    set selectionStyle(value) {
        this._selectionStyle = value;
    }
    /**
     * Get the codemirror editor wrapped by the editor.
     */
    get editor() {
        return this._editor;
    }
    /**
     * Get the codemirror doc wrapped by the widget.
     */
    get doc() {
        return this._editor.getDoc();
    }
    /**
     * Get the number of lines in the editor.
     */
    get lineCount() {
        return this.doc.lineCount();
    }
    /**
     * Returns a model for this editor.
     */
    get model() {
        return this._model;
    }
    /**
     * The height of a line in the editor in pixels.
     */
    get lineHeight() {
        return this._editor.defaultTextHeight();
    }
    /**
     * The widget of a character in the editor in pixels.
     */
    get charWidth() {
        return this._editor.defaultCharWidth();
    }
    /**
     * Tests whether the editor is disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Dispose of the resources held by the widget.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        this.host.removeEventListener('focus', this, true);
        this.host.removeEventListener('blur', this, true);
        this.host.removeEventListener('scroll', this, true);
        this._keydownHandlers.length = 0;
        window.clearInterval(this._timer);
        signaling_1.Signal.clearData(this);
    }
    /**
     * Get a config option for the editor.
     */
    getOption(option) {
        return this._config[option];
    }
    /**
     * Set a config option for the editor.
     */
    setOption(option, value) {
        // Don't bother setting the option if it is already the same.
        if (this._config[option] !== value) {
            this._config[option] = value;
            Private.setOption(this.editor, option, value, this._config);
        }
    }
    /**
     * Returns the content for the given line number.
     */
    getLine(line) {
        return this.doc.getLine(line);
    }
    /**
     * Find an offset for the given position.
     */
    getOffsetAt(position) {
        return this.doc.indexFromPos({
            ch: position.column,
            line: position.line
        });
    }
    /**
     * Find a position for the given offset.
     */
    getPositionAt(offset) {
        const { ch, line } = this.doc.posFromIndex(offset);
        return { line, column: ch };
    }
    /**
     * Undo one edit (if any undo events are stored).
     */
    undo() {
        this.doc.undo();
    }
    /**
     * Redo one undone edit.
     */
    redo() {
        this.doc.redo();
    }
    /**
     * Clear the undo history.
     */
    clearHistory() {
        this.doc.clearHistory();
    }
    /**
     * Brings browser focus to this editor text.
     */
    focus() {
        this._editor.focus();
    }
    /**
     * Test whether the editor has keyboard focus.
     */
    hasFocus() {
        return this._editor.getWrapperElement().contains(document.activeElement);
    }
    /**
     * Explicitly blur the editor.
     */
    blur() {
        this._editor.getInputField().blur();
    }
    /**
     * Repaint editor.
     */
    refresh() {
        this._editor.refresh();
        this._needsRefresh = false;
    }
    /**
     * Refresh the editor if it is focused;
     * otherwise postpone refreshing till focusing.
     */
    resizeToFit() {
        if (this.hasFocus()) {
            this.refresh();
        }
        else {
            this._needsRefresh = true;
        }
        this._clearHover();
    }
    /**
     * Add a keydown handler to the editor.
     *
     * @param handler - A keydown handler.
     *
     * @returns A disposable that can be used to remove the handler.
     */
    addKeydownHandler(handler) {
        this._keydownHandlers.push(handler);
        return new disposable_1.DisposableDelegate(() => {
            algorithm_1.ArrayExt.removeAllWhere(this._keydownHandlers, val => val === handler);
        });
    }
    /**
     * Set the size of the editor in pixels.
     */
    setSize(dimension) {
        if (dimension) {
            this._editor.setSize(dimension.width, dimension.height);
        }
        else {
            this._editor.setSize(null, null);
        }
        this._needsRefresh = false;
    }
    /**
     * Reveal the given position in the editor.
     */
    revealPosition(position) {
        const cmPosition = this._toCodeMirrorPosition(position);
        this._editor.scrollIntoView(cmPosition);
    }
    /**
     * Reveal the given selection in the editor.
     */
    revealSelection(selection) {
        const range = this._toCodeMirrorRange(selection);
        this._editor.scrollIntoView(range);
    }
    /**
     * Get the window coordinates given a cursor position.
     */
    getCoordinateForPosition(position) {
        const pos = this._toCodeMirrorPosition(position);
        const rect = this.editor.charCoords(pos, 'page');
        return rect;
    }
    /**
     * Get the cursor position given window coordinates.
     *
     * @param coordinate - The desired coordinate.
     *
     * @returns The position of the coordinates, or null if not
     *   contained in the editor.
     */
    getPositionForCoordinate(coordinate) {
        return this._toPosition(this.editor.coordsChar(coordinate)) || null;
    }
    /**
     * Returns the primary position of the cursor, never `null`.
     */
    getCursorPosition() {
        const cursor = this.doc.getCursor();
        return this._toPosition(cursor);
    }
    /**
     * Set the primary position of the cursor.
     *
     * #### Notes
     * This will remove any secondary cursors.
     */
    setCursorPosition(position) {
        const cursor = this._toCodeMirrorPosition(position);
        this.doc.setCursor(cursor);
        // If the editor does not have focus, this cursor change
        // will get screened out in _onCursorsChanged(). Make an
        // exception for this method.
        if (!this.editor.hasFocus()) {
            this.model.selections.set(this.uuid, this.getSelections());
        }
    }
    /**
     * Returns the primary selection, never `null`.
     */
    getSelection() {
        return this.getSelections()[0];
    }
    /**
     * Set the primary selection. This will remove any secondary cursors.
     */
    setSelection(selection) {
        this.setSelections([selection]);
    }
    /**
     * Gets the selections for all the cursors, never `null` or empty.
     */
    getSelections() {
        const selections = this.doc.listSelections();
        if (selections.length > 0) {
            return selections.map(selection => this._toSelection(selection));
        }
        const cursor = this.doc.getCursor();
        const selection = this._toSelection({ anchor: cursor, head: cursor });
        return [selection];
    }
    /**
     * Sets the selections for all the cursors, should not be empty.
     * Cursors will be removed or added, as necessary.
     * Passing an empty array resets a cursor position to the start of a document.
     */
    setSelections(selections) {
        const cmSelections = this._toCodeMirrorSelections(selections);
        this.doc.setSelections(cmSelections, 0);
    }
    /**
     * Get a list of tokens for the current editor text content.
     */
    getTokens() {
        let tokens = [];
        for (let i = 0; i < this.lineCount; ++i) {
            const lineTokens = this.editor.getLineTokens(i).map(t => ({
                offset: this.getOffsetAt({ column: t.start, line: i }),
                value: t.string,
                type: t.type || ''
            }));
            tokens = tokens.concat(lineTokens);
        }
        return tokens;
    }
    /**
     * Get the token at a given editor position.
     */
    getTokenForPosition(position) {
        const cursor = this._toCodeMirrorPosition(position);
        const token = this.editor.getTokenAt(cursor);
        return {
            offset: this.getOffsetAt({ column: token.start, line: cursor.line }),
            value: token.string,
            type: token.type
        };
    }
    /**
     * Insert a new indented line at the current cursor position.
     */
    newIndentedLine() {
        this.execCommand('newlineAndIndent');
    }
    /**
     * Execute a codemirror command on the editor.
     *
     * @param command - The name of the command to execute.
     */
    execCommand(command) {
        this._editor.execCommand(command);
    }
    /**
     * Handle keydown events from the editor.
     */
    onKeydown(event) {
        let position = this.getCursorPosition();
        let { line, column } = position;
        if (line === 0 && column === 0 && event.keyCode === UP_ARROW) {
            if (!event.shiftKey) {
                this.edgeRequested.emit('top');
            }
            return false;
        }
        let lastLine = this.lineCount - 1;
        let lastCh = this.getLine(lastLine).length;
        if (line === lastLine &&
            column === lastCh &&
            event.keyCode === DOWN_ARROW) {
            if (!event.shiftKey) {
                this.edgeRequested.emit('bottom');
            }
            return false;
        }
        return false;
    }
    /**
     * Converts selections to code mirror selections.
     */
    _toCodeMirrorSelections(selections) {
        if (selections.length > 0) {
            return selections.map(selection => this._toCodeMirrorSelection(selection));
        }
        const position = { line: 0, ch: 0 };
        return [{ anchor: position, head: position }];
    }
    /**
     * Handles a mime type change.
     */
    _onMimeTypeChanged() {
        const mime = this._model.mimeType;
        let editor = this._editor;
        mode_1.Mode.ensure(mime).then(spec => {
            editor.setOption('mode', spec.mime);
        });
        let extraKeys = editor.getOption('extraKeys') || {};
        const isCode = mime !== 'text/plain' && mime !== 'text/x-ipythongfm';
        if (isCode) {
            extraKeys['Backspace'] = 'delSpaceToPrevTabStop';
        }
        else {
            delete extraKeys['Backspace'];
        }
        editor.setOption('extraKeys', extraKeys);
    }
    /**
     * Handles a selections change.
     */
    _onSelectionsChanged(selections, args) {
        const uuid = args.key;
        if (uuid !== this.uuid) {
            this._cleanSelections(uuid);
            if (args.type !== 'remove' && args.newValue) {
                this._markSelections(uuid, args.newValue);
            }
        }
    }
    /**
     * Clean selections for the given uuid.
     */
    _cleanSelections(uuid) {
        const markers = this.selectionMarkers[uuid];
        if (markers) {
            markers.forEach(marker => {
                marker.clear();
            });
        }
        delete this.selectionMarkers[uuid];
    }
    /**
     * Marks selections.
     */
    _markSelections(uuid, selections) {
        const markers = [];
        // If we are marking selections corresponding to an active hover,
        // remove it.
        if (uuid === this._hoverId) {
            this._clearHover();
        }
        // If we can id the selection to a specific collaborator,
        // use that information.
        let collaborator;
        if (this._model.modelDB.collaborators) {
            collaborator = this._model.modelDB.collaborators.get(uuid);
        }
        // Style each selection for the uuid.
        selections.forEach(selection => {
            // Only render selections if the start is not equal to the end.
            // In that case, we don't need to render the cursor.
            if (!coreutils_1.JSONExt.deepEqual(selection.start, selection.end)) {
                const { anchor, head } = this._toCodeMirrorSelection(selection);
                let markerOptions;
                if (collaborator) {
                    markerOptions = this._toTextMarkerOptions(Object.assign({}, selection.style, { color: collaborator.color }));
                }
                else {
                    markerOptions = this._toTextMarkerOptions(selection.style);
                }
                markers.push(this.doc.markText(anchor, head, markerOptions));
            }
            else if (collaborator) {
                let caret = this._getCaret(collaborator);
                markers.push(this.doc.setBookmark(this._toCodeMirrorPosition(selection.end), {
                    widget: caret
                }));
            }
        });
        this.selectionMarkers[uuid] = markers;
    }
    /**
     * Handles a cursor activity event.
     */
    _onCursorActivity() {
        // Only add selections if the editor has focus. This avoids unwanted
        // triggering of cursor activity due to collaborator actions.
        if (this._editor.hasFocus()) {
            const selections = this.getSelections();
            this.model.selections.set(this.uuid, selections);
        }
    }
    /**
     * Converts a code mirror selection to an editor selection.
     */
    _toSelection(selection) {
        return {
            uuid: this.uuid,
            start: this._toPosition(selection.anchor),
            end: this._toPosition(selection.head),
            style: this.selectionStyle
        };
    }
    /**
     * Converts the selection style to a text marker options.
     */
    _toTextMarkerOptions(style) {
        let r = parseInt(style.color.slice(1, 3), 16);
        let g = parseInt(style.color.slice(3, 5), 16);
        let b = parseInt(style.color.slice(5, 7), 16);
        let css = `background-color: rgba( ${r}, ${g}, ${b}, 0.15)`;
        return {
            className: style.className,
            title: style.displayName,
            css
        };
    }
    /**
     * Converts an editor selection to a code mirror selection.
     */
    _toCodeMirrorSelection(selection) {
        // Selections only appear to render correctly if the anchor
        // is before the head in the document. That is, reverse selections
        // do not appear as intended.
        let forward = selection.start.line < selection.end.line ||
            (selection.start.line === selection.end.line &&
                selection.start.column <= selection.end.column);
        let anchor = forward ? selection.start : selection.end;
        let head = forward ? selection.end : selection.start;
        return {
            anchor: this._toCodeMirrorPosition(anchor),
            head: this._toCodeMirrorPosition(head)
        };
    }
    /**
     * Converts an editor selection to a code mirror selection.
     */
    _toCodeMirrorRange(range) {
        return {
            from: this._toCodeMirrorPosition(range.start),
            to: this._toCodeMirrorPosition(range.end)
        };
    }
    /**
     * Convert a code mirror position to an editor position.
     */
    _toPosition(position) {
        return {
            line: position.line,
            column: position.ch
        };
    }
    /**
     * Convert an editor position to a code mirror position.
     */
    _toCodeMirrorPosition(position) {
        return {
            line: position.line,
            ch: position.column
        };
    }
    /**
     * Handle model value changes.
     */
    _onValueChanged(value, args) {
        if (this._changeGuard) {
            return;
        }
        this._changeGuard = true;
        let doc = this.doc;
        switch (args.type) {
            case 'insert':
                let pos = doc.posFromIndex(args.start);
                doc.replaceRange(args.value, pos, pos);
                break;
            case 'remove':
                let from = doc.posFromIndex(args.start);
                let to = doc.posFromIndex(args.end);
                doc.replaceRange('', from, to);
                break;
            case 'set':
                doc.setValue(args.value);
                break;
            default:
                break;
        }
        this._changeGuard = false;
    }
    /**
     * Handles document changes.
     */
    _beforeDocChanged(doc, change) {
        if (this._changeGuard) {
            return;
        }
        this._changeGuard = true;
        let value = this._model.value;
        let start = doc.indexFromPos(change.from);
        let end = doc.indexFromPos(change.to);
        let inserted = change.text.join('\n');
        if (end !== start) {
            value.remove(start, end);
        }
        if (inserted) {
            value.insert(start, inserted);
        }
        this._changeGuard = false;
    }
    /**
     * Handle the DOM events for the editor.
     *
     * @param event - The DOM event sent to the editor.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the editor's DOM node. It should
     * not be called directly by user code.
     */
    handleEvent(event) {
        switch (event.type) {
            case 'focus':
                this._evtFocus(event);
                break;
            case 'blur':
                this._evtBlur(event);
                break;
            case 'scroll':
                this._evtScroll();
                break;
            default:
                break;
        }
    }
    /**
     * Handle `focus` events for the editor.
     */
    _evtFocus(event) {
        if (this._needsRefresh) {
            this.refresh();
        }
        this.host.classList.add('jp-mod-focused');
        // Update the selections on editor gaining focus because
        // the onCursorActivity function filters usual cursor events
        // based on the editor's focus.
        this._onCursorActivity();
    }
    /**
     * Handle `blur` events for the editor.
     */
    _evtBlur(event) {
        this.host.classList.remove('jp-mod-focused');
    }
    /**
     * Handle `scroll` events for the editor.
     */
    _evtScroll() {
        // Remove any active hover.
        this._clearHover();
    }
    /**
     * Clear the hover for a caret, due to things like
     * scrolling, resizing, deactivation, etc, where
     * the position is no longer valid.
     */
    _clearHover() {
        if (this._caretHover) {
            window.clearTimeout(this._hoverTimeout);
            document.body.removeChild(this._caretHover);
            this._caretHover = null;
        }
    }
    /**
     * Construct a caret element representing the position
     * of a collaborator's cursor.
     */
    _getCaret(collaborator) {
        let name = collaborator ? collaborator.displayName : 'Anonymous';
        let color = collaborator ? collaborator.color : this._selectionStyle.color;
        let caret = document.createElement('span');
        caret.className = COLLABORATOR_CURSOR_CLASS;
        caret.style.borderBottomColor = color;
        caret.onmouseenter = () => {
            this._clearHover();
            this._hoverId = collaborator.sessionId;
            let rect = caret.getBoundingClientRect();
            // Construct and place the hover box.
            let hover = document.createElement('div');
            hover.className = COLLABORATOR_HOVER_CLASS;
            hover.style.left = String(rect.left) + 'px';
            hover.style.top = String(rect.bottom) + 'px';
            hover.textContent = name;
            hover.style.backgroundColor = color;
            // If the user mouses over the hover, take over the timer.
            hover.onmouseenter = () => {
                window.clearTimeout(this._hoverTimeout);
            };
            hover.onmouseleave = () => {
                this._hoverTimeout = window.setTimeout(() => {
                    this._clearHover();
                }, HOVER_TIMEOUT);
            };
            this._caretHover = hover;
            document.body.appendChild(hover);
        };
        caret.onmouseleave = () => {
            this._hoverTimeout = window.setTimeout(() => {
                this._clearHover();
            }, HOVER_TIMEOUT);
        };
        return caret;
    }
    /**
     * Check for an out of sync editor.
     */
    _checkSync() {
        let change = this._lastChange;
        if (!change) {
            return;
        }
        this._lastChange = null;
        let editor = this._editor;
        let doc = editor.getDoc();
        if (doc.getValue() === this._model.value.text) {
            return;
        }
        apputils_1.showDialog({
            title: 'Code Editor out of Sync',
            body: 'Please open your browser JavaScript console for bug report instructions'
        });
        console.log('Please paste the following to https://github.com/jupyterlab/jupyterlab/issues/2951');
        console.log(JSON.stringify({
            model: this._model.value.text,
            view: doc.getValue(),
            selections: this.getSelections(),
            cursor: this.getCursorPosition(),
            lineSep: editor.getOption('lineSeparator'),
            mode: editor.getOption('mode'),
            change
        }));
    }
}
exports.CodeMirrorEditor = CodeMirrorEditor;
/**
 * The namespace for `CodeMirrorEditor` statics.
 */
(function (CodeMirrorEditor) {
    /**
     * The default configuration options for an editor.
     */
    CodeMirrorEditor.defaultConfig = Object.assign({}, codeeditor_1.CodeEditor.defaultConfig, { mode: 'null', theme: 'jupyter', smartIndent: true, electricChars: true, keyMap: 'default', extraKeys: null, gutters: [], fixedGutter: true, showCursorWhenSelecting: false, coverGutterNextToScrollbar: false, dragDrop: true, lineSeparator: null, scrollbarStyle: 'native', lineWiseCopyCut: true, scrollPastEnd: false });
    /**
     * Add a command to CodeMirror.
     *
     * @param name - The name of the command to add.
     *
     * @param command - The command function.
     */
    function addCommand(name, command) {
        codemirror_1.default.commands[name] = command;
    }
    CodeMirrorEditor.addCommand = addCommand;
})(CodeMirrorEditor = exports.CodeMirrorEditor || (exports.CodeMirrorEditor = {}));
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    function createEditor(host, config) {
        let { autoClosingBrackets, fontFamily, fontSize, insertSpaces, lineHeight, lineWrap, wordWrapColumn, tabSize, readOnly } = config, otherOptions = __rest(config, ["autoClosingBrackets", "fontFamily", "fontSize", "insertSpaces", "lineHeight", "lineWrap", "wordWrapColumn", "tabSize", "readOnly"]);
        let bareConfig = Object.assign({ autoCloseBrackets: autoClosingBrackets, indentUnit: tabSize, indentWithTabs: !insertSpaces, lineWrapping: lineWrap === 'off' ? false : true, readOnly }, otherOptions);
        return codemirror_1.default(el => {
            if (fontFamily) {
                el.style.fontFamily = fontFamily;
            }
            if (fontSize) {
                el.style.fontSize = fontSize + 'px';
            }
            if (lineHeight) {
                el.style.lineHeight = lineHeight.toString();
            }
            if (readOnly) {
                el.classList.add(READ_ONLY_CLASS);
            }
            if (lineWrap === 'wordWrapColumn') {
                const lines = el.querySelector('.CodeMirror-lines');
                lines.style.width = `${wordWrapColumn}ch`;
            }
            if (lineWrap === 'bounded') {
                const lines = el.querySelector('.CodeMirror-lines');
                lines.style.maxWidth = `${wordWrapColumn}ch`;
            }
            host.appendChild(el);
        }, bareConfig);
    }
    Private.createEditor = createEditor;
    /**
     * Indent or insert a tab as appropriate.
     */
    function indentMoreOrinsertTab(cm) {
        let doc = cm.getDoc();
        let from = doc.getCursor('from');
        let to = doc.getCursor('to');
        let sel = !posEq(from, to);
        if (sel) {
            codemirror_1.default.commands['indentMore'](cm);
            return;
        }
        // Check for start of line.
        let line = doc.getLine(from.line);
        let before = line.slice(0, from.ch);
        if (/^\s*$/.test(before)) {
            codemirror_1.default.commands['indentMore'](cm);
        }
        else {
            if (cm.getOption('indentWithTabs')) {
                codemirror_1.default.commands['insertTab'](cm);
            }
            else {
                codemirror_1.default.commands['insertSoftTab'](cm);
            }
        }
    }
    Private.indentMoreOrinsertTab = indentMoreOrinsertTab;
    /**
     * Delete spaces to the previous tab stob in a codemirror editor.
     */
    function delSpaceToPrevTabStop(cm) {
        let doc = cm.getDoc();
        let from = doc.getCursor('from');
        let to = doc.getCursor('to');
        let sel = !posEq(from, to);
        if (sel) {
            let ranges = doc.listSelections();
            for (let i = ranges.length - 1; i >= 0; i--) {
                let head = ranges[i].head;
                let anchor = ranges[i].anchor;
                doc.replaceRange('', codemirror_1.default.Pos(head.line, head.ch), codemirror_1.default.Pos(anchor.line, anchor.ch));
            }
            return;
        }
        let cur = doc.getCursor();
        let tabsize = cm.getOption('tabSize');
        let chToPrevTabStop = cur.ch - (Math.ceil(cur.ch / tabsize) - 1) * tabsize;
        from = { ch: cur.ch - chToPrevTabStop, line: cur.line };
        let select = doc.getRange(from, cur);
        if (select.match(/^\ +$/) !== null) {
            doc.replaceRange('', from, cur);
        }
        else {
            codemirror_1.default.commands['delCharBefore'](cm);
        }
    }
    Private.delSpaceToPrevTabStop = delSpaceToPrevTabStop;
    /**
     * Test whether two CodeMirror positions are equal.
     */
    function posEq(a, b) {
        return a.line === b.line && a.ch === b.ch;
    }
    Private.posEq = posEq;
    /**
     * Set a config option for the editor.
     */
    function setOption(editor, option, value, config) {
        let el = editor.getWrapperElement();
        switch (option) {
            case 'lineWrap':
                const lineWrapping = value === 'off' ? false : true;
                const lines = el.querySelector('.CodeMirror-lines');
                const maxWidth = value === 'bounded' ? `${config.wordWrapColumn}ch` : null;
                const width = value === 'wordWrapColumn' ? `${config.wordWrapColumn}ch` : null;
                lines.style.maxWidth = maxWidth;
                lines.style.width = width;
                editor.setOption('lineWrapping', lineWrapping);
                break;
            case 'wordWrapColumn':
                const { lineWrap } = config;
                if (lineWrap === 'wordWrapColumn' || lineWrap === 'bounded') {
                    const lines = el.querySelector('.CodeMirror-lines');
                    const prop = lineWrap === 'wordWrapColumn' ? 'width' : 'maxWidth';
                    lines.style[prop] = `${value}ch`;
                }
                break;
            case 'tabSize':
                editor.setOption('indentUnit', value);
                break;
            case 'insertSpaces':
                editor.setOption('indentWithTabs', !value);
                break;
            case 'autoClosingBrackets':
                editor.setOption('autoCloseBrackets', value);
                break;
            case 'readOnly':
                el.classList.toggle(READ_ONLY_CLASS, value);
                editor.setOption(option, value);
                break;
            case 'fontFamily':
                el.style.fontFamily = value;
                break;
            case 'fontSize':
                el.style.fontSize = value ? value + 'px' : null;
                break;
            case 'lineHeight':
                el.style.lineHeight = value ? value.toString() : null;
                break;
            default:
                editor.setOption(option, value);
                break;
        }
    }
    Private.setOption = setOption;
})(Private || (Private = {}));
/**
 * Add a CodeMirror command to delete until previous non blanking space
 * character or first multiple of tabsize tabstop.
 */
CodeMirrorEditor.addCommand('delSpaceToPrevTabStop', Private.delSpaceToPrevTabStop);
/**
 * Add a CodeMirror command to indent or insert a tab as appropriate.
 */
CodeMirrorEditor.addCommand('indentMoreOrinsertTab', Private.indentMoreOrinsertTab);
