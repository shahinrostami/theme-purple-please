"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
/**
 * A phosphor widget which wraps an IFrame.
 */
class IFrame extends widgets_1.Widget {
    /**
     * Create a new IFrame widget.
     */
    constructor() {
        super({ node: Private.createNode() });
        this.addClass('jp-IFrame');
    }
    /**
     * The url of the IFrame.
     */
    get url() {
        return this.node.querySelector('iframe').getAttribute('src') || '';
    }
    set url(url) {
        this.node.querySelector('iframe').setAttribute('src', url);
    }
}
exports.IFrame = IFrame;
/**
 * A namespace for private data.
 */
var Private;
(function (Private) {
    /**
     * Create the main content node of an iframe widget.
     */
    function createNode() {
        let node = document.createElement('div');
        let iframe = document.createElement('iframe');
        iframe.style.height = '100%';
        iframe.style.width = '100%';
        node.appendChild(iframe);
        return node;
    }
    Private.createNode = createNode;
})(Private || (Private = {}));
