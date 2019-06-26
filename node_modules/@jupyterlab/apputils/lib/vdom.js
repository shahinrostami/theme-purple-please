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
const messaging_1 = require("@phosphor/messaging");
const signaling_1 = require("@phosphor/signaling");
const widgets_1 = require("@phosphor/widgets");
const ReactDOM = __importStar(require("react-dom"));
/**
 * Phosphor widget that encodes best practices for VDOM based rendering.
 */
class VDomRenderer extends widgets_1.Widget {
    constructor() {
        super(...arguments);
        this._modelChanged = new signaling_1.Signal(this);
    }
    /**
     * A signal emitted when the model changes.
     */
    get modelChanged() {
        return this._modelChanged;
    }
    /**
     * Set the model and fire changed signals.
     */
    set model(newValue) {
        if (this._model === newValue) {
            return;
        }
        if (this._model) {
            this._model.stateChanged.disconnect(this.update, this);
        }
        this._model = newValue;
        if (newValue) {
            newValue.stateChanged.connect(this.update, this);
        }
        this.update();
        this._modelChanged.emit(void 0);
    }
    /**
     * Get the current model.
     */
    get model() {
        return this._model;
    }
    /**
     * Dispose this widget.
     */
    dispose() {
        this._model = null;
        super.dispose();
    }
    /**
     * Called to update the state of the widget.
     *
     * The default implementation of this method triggers
     * VDOM based rendering by calling the this.render() method.
     */
    onUpdateRequest(msg) {
        let vnode = this.render();
        if (Array.isArray(vnode)) {
            ReactDOM.render(vnode, this.node);
        }
        else {
            ReactDOM.render(vnode, this.node);
        }
    }
    /* Called after the widget is attached to the DOM
     *
     * Make sure the widget is rendered, even if the model has not changed.
     */
    onAfterAttach(msg) {
        messaging_1.MessageLoop.sendMessage(this, widgets_1.Widget.Msg.UpdateRequest);
    }
}
exports.VDomRenderer = VDomRenderer;
/**
 * Phosphor widget that renders React Element(s).
 *
 * All messages will re-render the element.
 */
class ReactElementWidget extends VDomRenderer {
    /**
     * Creates a Phosphor widget that renders the element(s) `es`.
     */
    constructor(es) {
        super();
        this._es = es;
    }
    render() {
        return this._es;
    }
}
exports.ReactElementWidget = ReactElementWidget;
/**
 * Concrete implementation of VDomRenderer model.
 */
class VDomModel {
    constructor() {
        /**
         * A signal emitted when any model state changes.
         */
        this.stateChanged = new signaling_1.Signal(this);
        this._isDisposed = false;
    }
    /**
     * Test whether the model is disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Dispose the model.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        signaling_1.Signal.clearData(this);
    }
}
exports.VDomModel = VDomModel;
