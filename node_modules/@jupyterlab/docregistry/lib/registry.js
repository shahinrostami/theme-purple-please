"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const algorithm_1 = require("@phosphor/algorithm");
const disposable_1 = require("@phosphor/disposable");
const signaling_1 = require("@phosphor/signaling");
const coreutils_1 = require("@jupyterlab/coreutils");
const default_1 = require("./default");
/**
 * The document registry.
 */
class DocumentRegistry {
    /**
     * Construct a new document registry.
     */
    constructor(options = {}) {
        this._modelFactories = Object.create(null);
        this._widgetFactories = Object.create(null);
        this._defaultWidgetFactory = '';
        this._defaultWidgetFactories = Object.create(null);
        this._defaultRenderedWidgetFactories = Object.create(null);
        this._widgetFactoryExtensions = Object.create(null);
        this._fileTypes = [];
        this._extenders = Object.create(null);
        this._changed = new signaling_1.Signal(this);
        this._isDisposed = false;
        let factory = options.textModelFactory;
        if (factory && factory.name !== 'text') {
            throw new Error('Text model factory must have the name `text`');
        }
        this._modelFactories['text'] = factory || new default_1.TextModelFactory();
        let fts = options.initialFileTypes || DocumentRegistry.defaultFileTypes;
        fts.forEach(ft => {
            let value = Object.assign({}, DocumentRegistry.fileTypeDefaults, ft);
            this._fileTypes.push(value);
        });
    }
    /**
     * A signal emitted when the registry has changed.
     */
    get changed() {
        return this._changed;
    }
    /**
     * Get whether the document registry has been disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Dispose of the resources held by the document registery.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        for (let modelName in this._modelFactories) {
            this._modelFactories[modelName].dispose();
        }
        for (let widgetName in this._widgetFactories) {
            this._widgetFactories[widgetName].dispose();
        }
        for (let widgetName in this._extenders) {
            this._extenders[widgetName].length = 0;
        }
        this._fileTypes.length = 0;
        signaling_1.Signal.clearData(this);
    }
    /**
     * Add a widget factory to the registry.
     *
     * @param factory - The factory instance to register.
     *
     * @returns A disposable which will unregister the factory.
     *
     * #### Notes
     * If a factory with the given `'displayName'` is already registered,
     * a warning will be logged, and this will be a no-op.
     * If `'*'` is given as a default extension, the factory will be registered
     * as the global default.
     * If an extension or global default is already registered, this factory
     * will override the existing default.
     */
    addWidgetFactory(factory) {
        let name = factory.name.toLowerCase();
        if (this._widgetFactories[name]) {
            console.warn(`Duplicate registered factory ${name}`);
            return new disposable_1.DisposableDelegate(Private.noOp);
        }
        this._widgetFactories[name] = factory;
        for (let ft of factory.defaultFor || []) {
            if (factory.fileTypes.indexOf(ft) === -1) {
                continue;
            }
            if (ft === '*') {
                this._defaultWidgetFactory = name;
            }
            else {
                this._defaultWidgetFactories[ft] = name;
            }
        }
        for (let ft of factory.defaultRendered || []) {
            if (factory.fileTypes.indexOf(ft) === -1) {
                continue;
            }
            this._defaultRenderedWidgetFactories[ft] = name;
        }
        // For convenience, store a mapping of file type name -> name
        for (let ft of factory.fileTypes) {
            if (!this._widgetFactoryExtensions[ft]) {
                this._widgetFactoryExtensions[ft] = [];
            }
            this._widgetFactoryExtensions[ft].push(name);
        }
        this._changed.emit({
            type: 'widgetFactory',
            name,
            change: 'added'
        });
        return new disposable_1.DisposableDelegate(() => {
            delete this._widgetFactories[name];
            if (this._defaultWidgetFactory === name) {
                this._defaultWidgetFactory = '';
            }
            for (let ext of Object.keys(this._defaultWidgetFactories)) {
                if (this._defaultWidgetFactories[ext] === name) {
                    delete this._defaultWidgetFactories[ext];
                }
            }
            for (let ext of Object.keys(this._defaultRenderedWidgetFactories)) {
                if (this._defaultRenderedWidgetFactories[ext] === name) {
                    delete this._defaultRenderedWidgetFactories[ext];
                }
            }
            for (let ext of Object.keys(this._widgetFactoryExtensions)) {
                algorithm_1.ArrayExt.removeFirstOf(this._widgetFactoryExtensions[ext], name);
                if (this._widgetFactoryExtensions[ext].length === 0) {
                    delete this._widgetFactoryExtensions[ext];
                }
            }
            this._changed.emit({
                type: 'widgetFactory',
                name,
                change: 'removed'
            });
        });
    }
    /**
     * Add a model factory to the registry.
     *
     * @param factory - The factory instance.
     *
     * @returns A disposable which will unregister the factory.
     *
     * #### Notes
     * If a factory with the given `name` is already registered, or
     * the given factory is already registered, a warning will be logged
     * and this will be a no-op.
     */
    addModelFactory(factory) {
        let name = factory.name.toLowerCase();
        if (this._modelFactories[name]) {
            console.warn(`Duplicate registered factory ${name}`);
            return new disposable_1.DisposableDelegate(Private.noOp);
        }
        this._modelFactories[name] = factory;
        this._changed.emit({
            type: 'modelFactory',
            name,
            change: 'added'
        });
        return new disposable_1.DisposableDelegate(() => {
            delete this._modelFactories[name];
            this._changed.emit({
                type: 'modelFactory',
                name,
                change: 'removed'
            });
        });
    }
    /**
     * Add a widget extension to the registry.
     *
     * @param widgetName - The name of the widget factory.
     *
     * @param extension - A widget extension.
     *
     * @returns A disposable which will unregister the extension.
     *
     * #### Notes
     * If the extension is already registered for the given
     * widget name, a warning will be logged and this will be a no-op.
     */
    addWidgetExtension(widgetName, extension) {
        widgetName = widgetName.toLowerCase();
        if (!(widgetName in this._extenders)) {
            this._extenders[widgetName] = [];
        }
        let extenders = this._extenders[widgetName];
        let index = algorithm_1.ArrayExt.firstIndexOf(extenders, extension);
        if (index !== -1) {
            console.warn(`Duplicate registered extension for ${widgetName}`);
            return new disposable_1.DisposableDelegate(Private.noOp);
        }
        this._extenders[widgetName].push(extension);
        this._changed.emit({
            type: 'widgetExtension',
            name: widgetName,
            change: 'added'
        });
        return new disposable_1.DisposableDelegate(() => {
            algorithm_1.ArrayExt.removeFirstOf(this._extenders[widgetName], extension);
            this._changed.emit({
                type: 'widgetExtension',
                name: widgetName,
                change: 'removed'
            });
        });
    }
    /**
     * Add a file type to the document registry.
     *
     * @params fileType - The file type object to register.
     *
     * @returns A disposable which will unregister the command.
     *
     * #### Notes
     * These are used to populate the "Create New" dialog.
     */
    addFileType(fileType) {
        let value = Object.assign({}, DocumentRegistry.fileTypeDefaults, fileType);
        this._fileTypes.push(value);
        this._changed.emit({
            type: 'fileType',
            name: value.name,
            change: 'added'
        });
        return new disposable_1.DisposableDelegate(() => {
            algorithm_1.ArrayExt.removeFirstOf(this._fileTypes, value);
            this._changed.emit({
                type: 'fileType',
                name: fileType.name,
                change: 'removed'
            });
        });
    }
    /**
     * Get a list of the preferred widget factories.
     *
     * @param path - The file path to filter the results.
     *
     * @returns A new array of widget factories.
     *
     * #### Notes
     * Only the widget factories whose associated model factory have
     * been registered will be returned.
     * The first item is considered the default. The returned array
     * has widget factories in the following order:
     * - path-specific default factory
     * - path-specific default rendered factory
     * - global default factory
     * - all other path-specific factories
     * - all other global factories
     */
    preferredWidgetFactories(path) {
        let factories = new Set();
        // Get the ordered matching file types.
        let fts = this.getFileTypesForPath(coreutils_1.PathExt.basename(path));
        // Start with the file type default factories.
        fts.forEach(ft => {
            if (ft.name in this._defaultWidgetFactories) {
                factories.add(this._defaultWidgetFactories[ft.name]);
            }
        });
        // Add the file type default rendered factories.
        fts.forEach(ft => {
            if (ft.name in this._defaultRenderedWidgetFactories) {
                factories.add(this._defaultRenderedWidgetFactories[ft.name]);
            }
        });
        // Add the global default factory.
        if (this._defaultWidgetFactory) {
            factories.add(this._defaultWidgetFactory);
        }
        // Add the file type factories in registration order.
        fts.forEach(ft => {
            if (ft.name in this._widgetFactoryExtensions) {
                algorithm_1.each(this._widgetFactoryExtensions[ft.name], n => {
                    factories.add(n);
                });
            }
        });
        // Add the rest of the global factories, in registration order.
        if ('*' in this._widgetFactoryExtensions) {
            algorithm_1.each(this._widgetFactoryExtensions['*'], n => {
                factories.add(n);
            });
        }
        // Construct the return list, checking to make sure the corresponding
        // model factories are registered.
        let factoryList = [];
        factories.forEach(name => {
            let factory = this._widgetFactories[name];
            if (!factory) {
                return;
            }
            let modelName = factory.modelName || 'text';
            if (modelName in this._modelFactories) {
                factoryList.push(factory);
            }
        });
        return factoryList;
    }
    /**
     * Get the default rendered widget factory for a path.
     *
     * @param path - The path to for which to find a widget factory.
     *
     * @returns The default rendered widget factory for the path.
     *
     * ### Notes
     * If the widget factory has registered a separate set of `defaultRendered`
     * file types and there is a match in that set, this returns that.
     * Otherwise, this returns the same widget factory as
     * [[defaultWidgetFactory]].
     */
    defaultRenderedWidgetFactory(path) {
        // Get the matching file types.
        let fts = this.getFileTypesForPath(coreutils_1.PathExt.basename(path));
        let factory = undefined;
        // Find if a there is a default rendered factory for this type.
        for (let ft of fts) {
            if (ft.name in this._defaultRenderedWidgetFactories) {
                factory = this._widgetFactories[this._defaultRenderedWidgetFactories[ft.name]];
                break;
            }
        }
        return factory || this.defaultWidgetFactory(path);
    }
    /**
     * Get the default widget factory for a path.
     *
     * @param path - An optional file path to filter the results.
     *
     * @returns The default widget factory for an path.
     *
     * #### Notes
     * This is equivalent to the first value in [[preferredWidgetFactories]].
     */
    defaultWidgetFactory(path) {
        if (!path) {
            return this._widgetFactories[this._defaultWidgetFactory];
        }
        return this.preferredWidgetFactories(path)[0];
    }
    /**
     * Create an iterator over the widget factories that have been registered.
     *
     * @returns A new iterator of widget factories.
     */
    widgetFactories() {
        return algorithm_1.map(Object.keys(this._widgetFactories), name => {
            return this._widgetFactories[name];
        });
    }
    /**
     * Create an iterator over the model factories that have been registered.
     *
     * @returns A new iterator of model factories.
     */
    modelFactories() {
        return algorithm_1.map(Object.keys(this._modelFactories), name => {
            return this._modelFactories[name];
        });
    }
    /**
     * Create an iterator over the registered extensions for a given widget.
     *
     * @param widgetName - The name of the widget factory.
     *
     * @returns A new iterator over the widget extensions.
     */
    widgetExtensions(widgetName) {
        widgetName = widgetName.toLowerCase();
        if (!(widgetName in this._extenders)) {
            return algorithm_1.empty();
        }
        return new algorithm_1.ArrayIterator(this._extenders[widgetName]);
    }
    /**
     * Create an iterator over the file types that have been registered.
     *
     * @returns A new iterator of file types.
     */
    fileTypes() {
        return new algorithm_1.ArrayIterator(this._fileTypes);
    }
    /**
     * Get a widget factory by name.
     *
     * @param widgetName - The name of the widget factory.
     *
     * @returns A widget factory instance.
     */
    getWidgetFactory(widgetName) {
        return this._widgetFactories[widgetName.toLowerCase()];
    }
    /**
     * Get a model factory by name.
     *
     * @param name - The name of the model factory.
     *
     * @returns A model factory instance.
     */
    getModelFactory(name) {
        return this._modelFactories[name.toLowerCase()];
    }
    /**
     * Get a file type by name.
     */
    getFileType(name) {
        name = name.toLowerCase();
        return algorithm_1.find(this._fileTypes, fileType => {
            return fileType.name.toLowerCase() === name;
        });
    }
    /**
     * Get a kernel preference.
     *
     * @param path - The file path.
     *
     * @param widgetName - The name of the widget factory.
     *
     * @param kernel - An optional existing kernel model.
     *
     * @returns A kernel preference.
     */
    getKernelPreference(path, widgetName, kernel) {
        widgetName = widgetName.toLowerCase();
        let widgetFactory = this._widgetFactories[widgetName];
        if (!widgetFactory) {
            return void 0;
        }
        let modelFactory = this.getModelFactory(widgetFactory.modelName || 'text');
        if (!modelFactory) {
            return void 0;
        }
        let language = modelFactory.preferredLanguage(coreutils_1.PathExt.basename(path));
        let name = kernel && kernel.name;
        let id = kernel && kernel.id;
        return {
            id,
            name,
            language,
            shouldStart: widgetFactory.preferKernel,
            canStart: widgetFactory.canStartKernel
        };
    }
    /**
     * Get the best file type given a contents model.
     *
     * @param model - The contents model of interest.
     *
     * @returns The best matching file type.
     */
    getFileTypeForModel(model) {
        switch (model.type) {
            case 'directory':
                return (algorithm_1.find(this._fileTypes, ft => ft.contentType === 'directory') ||
                    DocumentRegistry.defaultDirectoryFileType);
            case 'notebook':
                return (algorithm_1.find(this._fileTypes, ft => ft.contentType === 'notebook') ||
                    DocumentRegistry.defaultNotebookFileType);
            default:
                // Find the best matching extension.
                if (model.name || model.path) {
                    let name = model.name || coreutils_1.PathExt.basename(model.path);
                    let fts = this.getFileTypesForPath(name);
                    if (fts.length > 0) {
                        return fts[0];
                    }
                }
                return this.getFileType('text') || DocumentRegistry.defaultTextFileType;
        }
    }
    /**
     * Get the file types that match a file name.
     *
     * @param path - The path of the file.
     *
     * @returns An ordered list of matching file types.
     */
    getFileTypesForPath(path) {
        let fts = [];
        let name = coreutils_1.PathExt.basename(path);
        // Look for a pattern match first.
        let ft = algorithm_1.find(this._fileTypes, ft => {
            return ft.pattern && ft.pattern.match(name) !== null;
        });
        if (ft) {
            fts.push(ft);
        }
        // Then look by extension name, starting with the longest
        let ext = Private.extname(name);
        while (ext.length > 1) {
            ft = algorithm_1.find(this._fileTypes, ft => ft.extensions.indexOf(ext) !== -1);
            if (ft) {
                fts.push(ft);
            }
            ext =
                '.' +
                    ext
                        .split('.')
                        .slice(2)
                        .join('.');
        }
        return fts;
    }
}
exports.DocumentRegistry = DocumentRegistry;
/**
 * The namespace for the `DocumentRegistry` class statics.
 */
(function (DocumentRegistry) {
    /**
     * The defaults used for a file type.
     */
    DocumentRegistry.fileTypeDefaults = {
        name: 'default',
        extensions: [],
        mimeTypes: [],
        iconClass: 'jp-MaterialIcon jp-FileIcon',
        iconLabel: '',
        contentType: 'file',
        fileFormat: 'text'
    };
    /**
     * The default text file type used by the document registry.
     */
    DocumentRegistry.defaultTextFileType = Object.assign({}, DocumentRegistry.fileTypeDefaults, { name: 'text', mimeTypes: ['text/plain'], extensions: ['.txt'] });
    /**
     * The default notebook file type used by the document registry.
     */
    DocumentRegistry.defaultNotebookFileType = Object.assign({}, DocumentRegistry.fileTypeDefaults, { name: 'notebook', displayName: 'Notebook', mimeTypes: ['application/x-ipynb+json'], extensions: ['.ipynb'], contentType: 'notebook', fileFormat: 'json', iconClass: 'jp-MaterialIcon jp-NotebookIcon' });
    /**
     * The default directory file type used by the document registry.
     */
    DocumentRegistry.defaultDirectoryFileType = Object.assign({}, DocumentRegistry.fileTypeDefaults, { name: 'directory', extensions: [], mimeTypes: ['text/directory'], contentType: 'directory', iconClass: 'jp-MaterialIcon jp-OpenFolderIcon' });
    /**
     * The default file types used by the document registry.
     */
    DocumentRegistry.defaultFileTypes = [
        DocumentRegistry.defaultTextFileType,
        DocumentRegistry.defaultNotebookFileType,
        DocumentRegistry.defaultDirectoryFileType,
        {
            name: 'markdown',
            displayName: 'Markdown File',
            extensions: ['.md'],
            mimeTypes: ['text/markdown'],
            iconClass: 'jp-MaterialIcon jp-MarkdownIcon'
        },
        {
            name: 'python',
            displayName: 'Python File',
            extensions: ['.py'],
            mimeTypes: ['text/x-python'],
            iconClass: 'jp-MaterialIcon jp-PythonIcon'
        },
        {
            name: 'json',
            displayName: 'JSON File',
            extensions: ['.json'],
            mimeTypes: ['application/json'],
            iconClass: 'jp-MaterialIcon jp-JSONIcon'
        },
        {
            name: 'csv',
            displayName: 'CSV File',
            extensions: ['.csv'],
            mimeTypes: ['text/csv'],
            iconClass: 'jp-MaterialIcon jp-SpreadsheetIcon'
        },
        {
            name: 'tsv',
            displayName: 'TSV File',
            extensions: ['.tsv'],
            mimeTypes: ['text/csv'],
            iconClass: 'jp-MaterialIcon jp-SpreadsheetIcon'
        },
        {
            name: 'r',
            displayName: 'R File',
            mimeTypes: ['text/x-rsrc'],
            extensions: ['.r'],
            iconClass: 'jp-MaterialIcon jp-RKernelIcon'
        },
        {
            name: 'yaml',
            displayName: 'YAML File',
            mimeTypes: ['text/x-yaml', 'text/yaml'],
            extensions: ['.yaml', '.yml'],
            iconClass: 'jp-MaterialIcon jp-YamlIcon'
        },
        {
            name: 'svg',
            displayName: 'Image',
            mimeTypes: ['image/svg+xml'],
            extensions: ['.svg'],
            iconClass: 'jp-MaterialIcon jp-ImageIcon',
            fileFormat: 'base64'
        },
        {
            name: 'tiff',
            displayName: 'Image',
            mimeTypes: ['image/tiff'],
            extensions: ['.tif', '.tiff'],
            iconClass: 'jp-MaterialIcon jp-ImageIcon',
            fileFormat: 'base64'
        },
        {
            name: 'jpeg',
            displayName: 'Image',
            mimeTypes: ['image/jpeg'],
            extensions: ['.jpg', '.jpeg'],
            iconClass: 'jp-MaterialIcon jp-ImageIcon',
            fileFormat: 'base64'
        },
        {
            name: 'gif',
            displayName: 'Image',
            mimeTypes: ['image/gif'],
            extensions: ['.gif'],
            iconClass: 'jp-MaterialIcon jp-ImageIcon',
            fileFormat: 'base64'
        },
        {
            name: 'png',
            displayName: 'Image',
            mimeTypes: ['image/png'],
            extensions: ['.png'],
            iconClass: 'jp-MaterialIcon jp-ImageIcon',
            fileFormat: 'base64'
        },
        {
            name: 'bmp',
            displayName: 'Image',
            mimeTypes: ['image/bmp'],
            extensions: ['.bmp'],
            iconClass: 'jp-MaterialIcon jp-ImageIcon',
            fileFormat: 'base64'
        }
    ];
})(DocumentRegistry = exports.DocumentRegistry || (exports.DocumentRegistry = {}));
/**
 * A private namespace for DocumentRegistry data.
 */
var Private;
(function (Private) {
    /**
     * Get the extension name of a path.
     *
     * @param file - string.
     *
     * #### Notes
     * Dotted filenames (e.g. `".table.json"` are allowed).
     */
    function extname(path) {
        let parts = coreutils_1.PathExt.basename(path).split('.');
        parts.shift();
        let ext = '.' + parts.join('.');
        return ext.toLowerCase();
    }
    Private.extname = extname;
    /**
     * A no-op function.
     */
    function noOp() {
        /* no-op */
    }
    Private.noOp = noOp;
})(Private || (Private = {}));
