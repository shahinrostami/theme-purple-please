"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_1 = require("@jupyterlab/coreutils");
const rendermime_1 = require("@jupyterlab/rendermime");
const coreutils_2 = require("@phosphor/coreutils");
const messaging_1 = require("@phosphor/messaging");
const widgets_1 = require("@phosphor/widgets");
const default_1 = require("./default");
/**
 * A content widget for a rendered mimetype document.
 */
class MimeContent extends widgets_1.Widget {
    /**
     * Construct a new widget.
     */
    constructor(options) {
        super();
        /**
         * A bound change callback.
         */
        this._changeCallback = (options) => {
            if (!options.data || !options.data[this.mimeType]) {
                return;
            }
            let data = options.data[this.mimeType];
            if (typeof data === 'string') {
                this._context.model.fromString(data);
            }
            else {
                this._context.model.fromJSON(data);
            }
        };
        this._ready = new coreutils_2.PromiseDelegate();
        this._isRendering = false;
        this._renderRequested = false;
        this.addClass('jp-MimeDocument');
        this.mimeType = options.mimeType;
        this._dataType = options.dataType || 'string';
        this._context = options.context;
        this.renderer = options.renderer;
        const layout = (this.layout = new widgets_1.StackedLayout());
        layout.addWidget(this.renderer);
        this._context.ready
            .then(() => {
            return this._render();
        })
            .then(() => {
            // After rendering for the first time, send an activation request if we
            // are currently focused.
            if (this.node === document.activeElement) {
                // We want to synchronously send (not post) the activate message, while
                // we know this node still has focus.
                messaging_1.MessageLoop.sendMessage(this.renderer, widgets_1.Widget.Msg.ActivateRequest);
            }
            // Throttle the rendering rate of the widget.
            this._monitor = new coreutils_1.ActivityMonitor({
                signal: this._context.model.contentChanged,
                timeout: options.renderTimeout
            });
            this._monitor.activityStopped.connect(this.update, this);
            this._ready.resolve(undefined);
        })
            .catch(reason => {
            // Dispose the document if rendering fails.
            requestAnimationFrame(() => {
                this.dispose();
            });
            apputils_1.showErrorMessage(`Renderer Failure: ${this._context.path}`, reason);
        });
    }
    /**
     * A promise that resolves when the widget is ready.
     */
    get ready() {
        return this._ready.promise;
    }
    /**
     * Dispose of the resources held by the widget.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        if (this._monitor) {
            this._monitor.dispose();
        }
        this._monitor = null;
        super.dispose();
    }
    /**
     * Handle an `update-request` message to the widget.
     */
    onUpdateRequest(msg) {
        if (this._context.isReady) {
            this._render();
        }
    }
    /**
     * Render the mime content.
     */
    _render() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isDisposed) {
                return;
            }
            // Since rendering is async, we note render requests that happen while we
            // actually are rendering for a future rendering.
            if (this._isRendering) {
                this._renderRequested = true;
                return;
            }
            // Set up for this rendering pass.
            this._renderRequested = false;
            let context = this._context;
            let model = context.model;
            let data = {};
            if (this._dataType === 'string') {
                data[this.mimeType] = model.toString();
            }
            else {
                data[this.mimeType] = model.toJSON();
            }
            let mimeModel = new rendermime_1.MimeModel({ data, callback: this._changeCallback });
            try {
                // Do the rendering asynchronously.
                this._isRendering = true;
                yield this.renderer.renderModel(mimeModel);
                this._isRendering = false;
                // If there is an outstanding request to render, go ahead and render
                if (this._renderRequested) {
                    return this._render();
                }
            }
            catch (reason) {
                // Dispose the document if rendering fails.
                requestAnimationFrame(() => {
                    this.dispose();
                });
                apputils_1.showErrorMessage(`Renderer Failure: ${context.path}`, reason);
            }
        });
    }
}
exports.MimeContent = MimeContent;
/**
 * A document widget for mime content.
 */
class MimeDocument extends default_1.DocumentWidget {
}
exports.MimeDocument = MimeDocument;
/**
 * An implementation of a widget factory for a rendered mimetype document.
 */
class MimeDocumentFactory extends default_1.ABCWidgetFactory {
    /**
     * Construct a new mimetype widget factory.
     */
    constructor(options) {
        super(Private.createRegistryOptions(options));
        this._rendermime = options.rendermime;
        this._renderTimeout = options.renderTimeout || 1000;
        this._dataType = options.dataType || 'string';
        this._fileType = options.primaryFileType;
    }
    /**
     * Create a new widget given a context.
     */
    createNewWidget(context) {
        const ft = this._fileType;
        const mimeType = ft.mimeTypes.length ? ft.mimeTypes[0] : 'text/plain';
        const rendermime = this._rendermime.clone({
            resolver: context.urlResolver
        });
        const renderer = rendermime.createRenderer(mimeType);
        const content = new MimeContent({
            context,
            renderer,
            mimeType,
            renderTimeout: this._renderTimeout,
            dataType: this._dataType
        });
        content.title.iconClass = ft.iconClass;
        content.title.iconLabel = ft.iconLabel;
        const widget = new MimeDocument({ content, context });
        return widget;
    }
}
exports.MimeDocumentFactory = MimeDocumentFactory;
/**
 * The namespace for the module implementation details.
 */
var Private;
(function (Private) {
    /**
     * Create the document registry options.
     */
    function createRegistryOptions(options) {
        return Object.assign({}, options, { readOnly: true });
    }
    Private.createRegistryOptions = createRegistryOptions;
})(Private || (Private = {}));
