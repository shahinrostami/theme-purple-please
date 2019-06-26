"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
/**
 * The spinner class.
 */
class Spinner extends widgets_1.Widget {
    /**
     * Construct a spinner widget.
     */
    constructor() {
        super();
        this.addClass('jp-Spinner');
        this.node.tabIndex = -1;
        let content = document.createElement('div');
        content.className = 'jp-SpinnerContent';
        this.node.appendChild(content);
    }
    /**
     * Handle `'activate-request'` messages.
     */
    onActivateRequest(msg) {
        this.node.focus();
    }
}
exports.Spinner = Spinner;
