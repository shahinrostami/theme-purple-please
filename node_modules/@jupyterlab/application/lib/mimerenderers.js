"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const docregistry_1 = require("@jupyterlab/docregistry");
const rendermime_1 = require("@jupyterlab/rendermime");
const coreutils_1 = require("@phosphor/coreutils");
const properties_1 = require("@phosphor/properties");
const layoutrestorer_1 = require("./layoutrestorer");
/* tslint:disable */
/**
 * The mime document tracker token.
 */
exports.IMimeDocumentTracker = new coreutils_1.Token('@jupyterlab/application:IMimeDocumentTracker');
/* tslint:enable */
/**
 * Create rendermime plugins for rendermime extension modules.
 */
function createRendermimePlugins(extensions) {
    const plugins = [];
    const namespace = 'application-mimedocuments';
    const tracker = new apputils_1.InstanceTracker({ namespace });
    extensions.forEach(mod => {
        let data = mod.default;
        // Handle CommonJS exports.
        if (!mod.hasOwnProperty('__esModule')) {
            data = mod;
        }
        if (!Array.isArray(data)) {
            data = [data];
        }
        data.forEach(item => {
            plugins.push(createRendermimePlugin(tracker, item));
        });
    });
    // Also add a meta-plugin handling state restoration
    // and exposing the mime document instance tracker.
    plugins.push({
        id: '@jupyterlab/application:mimedocument',
        requires: [layoutrestorer_1.ILayoutRestorer],
        provides: exports.IMimeDocumentTracker,
        autoStart: true,
        activate: (app, restorer) => {
            restorer.restore(tracker, {
                command: 'docmanager:open',
                args: widget => ({
                    path: widget.context.path,
                    factory: Private.factoryNameProperty.get(widget)
                }),
                name: widget => `${widget.context.path}:${Private.factoryNameProperty.get(widget)}`
            });
            return tracker;
        }
    });
    return plugins;
}
exports.createRendermimePlugins = createRendermimePlugins;
/**
 * Create rendermime plugins for rendermime extension modules.
 */
function createRendermimePlugin(tracker, item) {
    return {
        id: item.id,
        requires: [layoutrestorer_1.ILayoutRestorer, rendermime_1.IRenderMimeRegistry],
        autoStart: true,
        activate: (app, restorer, rendermime) => {
            // Add the mime renderer.
            if (item.rank !== undefined) {
                rendermime.addFactory(item.rendererFactory, item.rank);
            }
            else {
                rendermime.addFactory(item.rendererFactory);
            }
            // Handle the widget factory.
            if (!item.documentWidgetFactoryOptions) {
                return;
            }
            let registry = app.docRegistry;
            let options = [];
            if (Array.isArray(item.documentWidgetFactoryOptions)) {
                options = item.documentWidgetFactoryOptions;
            }
            else {
                options = [
                    item.documentWidgetFactoryOptions
                ];
            }
            if (item.fileTypes) {
                item.fileTypes.forEach(ft => {
                    app.docRegistry.addFileType(ft);
                });
            }
            options.forEach(option => {
                const toolbarFactory = option.toolbarFactory
                    ? (w) => option.toolbarFactory(w.content.renderer)
                    : undefined;
                let factory = new docregistry_1.MimeDocumentFactory({
                    renderTimeout: item.renderTimeout,
                    dataType: item.dataType,
                    rendermime,
                    modelName: option.modelName,
                    name: option.name,
                    primaryFileType: registry.getFileType(option.primaryFileType),
                    fileTypes: option.fileTypes,
                    defaultFor: option.defaultFor,
                    defaultRendered: option.defaultRendered,
                    toolbarFactory
                });
                registry.addWidgetFactory(factory);
                factory.widgetCreated.connect((sender, widget) => {
                    Private.factoryNameProperty.set(widget, factory.name);
                    // Notify the instance tracker if restore data needs to update.
                    widget.context.pathChanged.connect(() => {
                        tracker.save(widget);
                    });
                    tracker.add(widget);
                });
            });
        }
    };
}
exports.createRendermimePlugin = createRendermimePlugin;
/**
 * Private namespace for the module.
 */
var Private;
(function (Private) {
    /**
     * An attached property for keeping the factory name
     * that was used to create a mimedocument.
     */
    Private.factoryNameProperty = new properties_1.AttachedProperty({
        name: 'factoryName',
        create: () => undefined
    });
})(Private || (Private = {}));
