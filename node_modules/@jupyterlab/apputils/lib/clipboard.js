"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
/**
 * The clipboard interface.
 */
var Clipboard;
(function (Clipboard) {
    /**
     * Get the application clipboard instance.
     */
    function getInstance() {
        return Private.instance;
    }
    Clipboard.getInstance = getInstance;
    /**
     * Set the application clipboard instance.
     */
    function setInstance(value) {
        Private.instance = value;
    }
    Clipboard.setInstance = setInstance;
    /**
     * Copy text to the system clipboard.
     *
     * #### Notes
     * This can only be called in response to a user input event.
     */
    function copyToSystem(text) {
        let node = document.body;
        let handler = (event) => {
            let data = event.clipboardData || window.clipboardData;
            data.setData('text', text);
            event.preventDefault();
            node.removeEventListener('copy', handler);
        };
        node.addEventListener('copy', handler);
        generateEvent(node);
    }
    Clipboard.copyToSystem = copyToSystem;
    /**
     * Generate a clipboard event on a node.
     *
     * @param node - The element on which to generate the event.
     *
     * @param type - The type of event to generate.
     *   `'paste'` events cannot be programmatically generated.
     *
     * #### Notes
     * This can only be called in response to a user input event.
     */
    function generateEvent(node, type = 'copy') {
        // http://stackoverflow.com/a/5210367
        // Identify selected text.
        let sel = window.getSelection();
        // Save the current selection.
        let savedRanges = [];
        for (let i = 0, len = sel.rangeCount; i < len; ++i) {
            savedRanges[i] = sel.getRangeAt(i).cloneRange();
        }
        // Select the node content.
        let range = document.createRange();
        range.selectNodeContents(node);
        sel.removeAllRanges();
        sel.addRange(range);
        // Execute the command.
        document.execCommand(type);
        // Restore the previous selection.
        sel = window.getSelection();
        sel.removeAllRanges();
        for (let i = 0, len = savedRanges.length; i < len; ++i) {
            sel.addRange(savedRanges[i]);
        }
    }
    Clipboard.generateEvent = generateEvent;
})(Clipboard = exports.Clipboard || (exports.Clipboard = {}));
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * The application clipboard instance.
     */
    Private.instance = new coreutils_1.MimeData();
})(Private || (Private = {}));
