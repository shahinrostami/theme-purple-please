"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const algorithm_1 = require("@phosphor/algorithm");
const domutils_1 = require("@phosphor/domutils");
/**
 * The namespace for DOM utilities.
 */
var DOMUtils;
(function (DOMUtils) {
    /**
     * Get the index of the node at a client position, or `-1`.
     */
    function hitTestNodes(nodes, x, y) {
        return algorithm_1.ArrayExt.findFirstIndex(nodes, node => {
            return domutils_1.ElementExt.hitTest(node, x, y);
        });
    }
    DOMUtils.hitTestNodes = hitTestNodes;
    /**
     * Find the first element matching a class name.
     */
    function findElement(parent, className) {
        return parent.querySelector(`.${className}`);
    }
    DOMUtils.findElement = findElement;
})(DOMUtils = exports.DOMUtils || (exports.DOMUtils = {}));
