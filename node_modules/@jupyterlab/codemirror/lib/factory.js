"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const editor_1 = require("./editor");
/**
 * CodeMirror editor factory.
 */
class CodeMirrorEditorFactory {
    /**
     * Construct an IEditorFactoryService for CodeMirrorEditors.
     */
    constructor(defaults = {}) {
        /**
         * Create a new editor for inline code.
         */
        this.newInlineEditor = (options) => {
            options.host.dataset.type = 'inline';
            return new editor_1.CodeMirrorEditor(Object.assign({}, options, { config: Object.assign({}, this.inlineCodeMirrorConfig, (options.config || {})) }));
        };
        /**
         * Create a new editor for a full document.
         */
        this.newDocumentEditor = (options) => {
            options.host.dataset.type = 'document';
            return new editor_1.CodeMirrorEditor(Object.assign({}, options, { config: Object.assign({}, this.documentCodeMirrorConfig, (options.config || {})) }));
        };
        this.inlineCodeMirrorConfig = Object.assign({}, editor_1.CodeMirrorEditor.defaultConfig, { extraKeys: {
                'Cmd-Right': 'goLineRight',
                End: 'goLineRight',
                'Cmd-Left': 'goLineLeft',
                Tab: 'indentMoreOrinsertTab',
                'Shift-Tab': 'indentLess',
                'Cmd-/': 'toggleComment',
                'Ctrl-/': 'toggleComment'
            } }, defaults);
        this.documentCodeMirrorConfig = Object.assign({}, editor_1.CodeMirrorEditor.defaultConfig, { extraKeys: {
                Tab: 'indentMoreOrinsertTab',
                'Shift-Tab': 'indentLess',
                'Cmd-/': 'toggleComment',
                'Ctrl-/': 'toggleComment',
                'Shift-Enter': () => {
                    /* no-op */
                }
            }, lineNumbers: true, scrollPastEnd: true }, defaults);
    }
}
exports.CodeMirrorEditorFactory = CodeMirrorEditorFactory;
