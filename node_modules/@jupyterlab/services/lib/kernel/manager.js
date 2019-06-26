"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const algorithm_1 = require("@phosphor/algorithm");
const coreutils_1 = require("@phosphor/coreutils");
const signaling_1 = require("@phosphor/signaling");
const __1 = require("..");
const kernel_1 = require("./kernel");
/**
 * An implementation of a kernel manager.
 */
class KernelManager {
    /**
     * Construct a new kernel manager.
     *
     * @param options - The default options for kernel.
     */
    constructor(options = {}) {
        this._models = [];
        this._kernels = new Set();
        this._specs = null;
        this._isDisposed = false;
        this._modelsTimer = -1;
        this._specsTimer = -1;
        this._isReady = false;
        this._specsChanged = new signaling_1.Signal(this);
        this._runningChanged = new signaling_1.Signal(this);
        this.serverSettings =
            options.serverSettings || __1.ServerConnection.makeSettings();
        // Initialize internal data.
        this._readyPromise = this._refreshSpecs().then(() => {
            return this._refreshRunning();
        });
        // Set up polling.
        this._modelsTimer = setInterval(() => {
            if (typeof document !== 'undefined' && document.hidden) {
                // Don't poll when nobody's looking.
                return;
            }
            this._refreshRunning();
        }, 10000);
        this._specsTimer = setInterval(() => {
            if (typeof document !== 'undefined' && document.hidden) {
                // Don't poll when nobody's looking.
                return;
            }
            this._refreshSpecs();
        }, 61000);
    }
    /**
     * A signal emitted when the specs change.
     */
    get specsChanged() {
        return this._specsChanged;
    }
    /**
     * A signal emitted when the running kernels change.
     */
    get runningChanged() {
        return this._runningChanged;
    }
    /**
     * Test whether the terminal manager is disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Dispose of the resources used by the manager.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        clearInterval(this._modelsTimer);
        clearInterval(this._specsTimer);
        signaling_1.Signal.clearData(this);
        this._models = [];
    }
    /**
     * Get the most recently fetched kernel specs.
     */
    get specs() {
        return this._specs;
    }
    /**
     * Test whether the manager is ready.
     */
    get isReady() {
        return this._isReady;
    }
    /**
     * A promise that fulfills when the manager is ready.
     */
    get ready() {
        return this._readyPromise;
    }
    /**
     * Create an iterator over the most recent running kernels.
     *
     * @returns A new iterator over the running kernels.
     */
    running() {
        return algorithm_1.iter(this._models);
    }
    /**
     * Force a refresh of the specs from the server.
     *
     * @returns A promise that resolves when the specs are fetched.
     *
     * #### Notes
     * This is intended to be called only in response to a user action,
     * since the manager maintains its internal state.
     */
    refreshSpecs() {
        return this._refreshSpecs();
    }
    /**
     * Force a refresh of the running kernels.
     *
     * @returns A promise that with the list of running sessions.
     *
     * #### Notes
     * This is not typically meant to be called by the user, since the
     * manager maintains its own internal state.
     */
    refreshRunning() {
        return this._refreshRunning();
    }
    /**
     * Start a new kernel.
     *
     * @param options - The kernel options to use.
     *
     * @returns A promise that resolves with the kernel instance.
     *
     * #### Notes
     * The manager `serverSettings` will be always be used.
     */
    startNew(options = {}) {
        let newOptions = Object.assign({}, options, { serverSettings: this.serverSettings });
        return kernel_1.Kernel.startNew(newOptions).then(kernel => {
            this._onStarted(kernel);
            return kernel;
        });
    }
    /**
     * Find a kernel by id.
     *
     * @param id - The id of the target kernel.
     *
     * @returns A promise that resolves with the kernel's model.
     */
    findById(id) {
        return kernel_1.Kernel.findById(id, this.serverSettings);
    }
    /**
     * Connect to an existing kernel.
     *
     * @param model - The model of the target kernel.
     *
     * @returns A promise that resolves with the new kernel instance.
     */
    connectTo(model) {
        let kernel = kernel_1.Kernel.connectTo(model, this.serverSettings);
        this._onStarted(kernel);
        return kernel;
    }
    /**
     * Shut down a kernel by id.
     *
     * @param id - The id of the target kernel.
     *
     * @returns A promise that resolves when the operation is complete.
     *
     * #### Notes
     * This will emit [[runningChanged]] if the running kernels list
     * changes.
     */
    shutdown(id) {
        let index = algorithm_1.ArrayExt.findFirstIndex(this._models, value => value.id === id);
        if (index === -1) {
            return;
        }
        // Proactively remove the model.
        this._models.splice(index, 1);
        this._runningChanged.emit(this._models.slice());
        return kernel_1.Kernel.shutdown(id, this.serverSettings).then(() => {
            let toRemove = [];
            this._kernels.forEach(k => {
                if (k.id === id) {
                    k.dispose();
                    toRemove.push(k);
                }
            });
            toRemove.forEach(k => {
                this._kernels.delete(k);
            });
        });
    }
    /**
     * Shut down all kernels.
     *
     * @returns A promise that resolves when all of the kernels are shut down.
     */
    shutdownAll() {
        // Proactively remove all models.
        let models = this._models;
        if (models.length > 0) {
            this._models = [];
            this._runningChanged.emit([]);
        }
        return this._refreshRunning().then(() => {
            return Promise.all(models.map(model => {
                return kernel_1.Kernel.shutdown(model.id, this.serverSettings).then(() => {
                    let toRemove = [];
                    this._kernels.forEach(k => {
                        k.dispose();
                        toRemove.push(k);
                    });
                    toRemove.forEach(k => {
                        this._kernels.delete(k);
                    });
                });
            })).then(() => {
                return undefined;
            });
        });
    }
    /**
     * Handle a kernel terminating.
     */
    _onTerminated(id) {
        let index = algorithm_1.ArrayExt.findFirstIndex(this._models, value => value.id === id);
        if (index !== -1) {
            this._models.splice(index, 1);
            this._runningChanged.emit(this._models.slice());
        }
    }
    /**
     * Handle a kernel starting.
     */
    _onStarted(kernel) {
        let id = kernel.id;
        this._kernels.add(kernel);
        let index = algorithm_1.ArrayExt.findFirstIndex(this._models, value => value.id === id);
        if (index === -1) {
            this._models.push(kernel.model);
            this._runningChanged.emit(this._models.slice());
        }
        kernel.terminated.connect(() => {
            this._onTerminated(id);
        });
    }
    /**
     * Refresh the specs.
     */
    _refreshSpecs() {
        return kernel_1.Kernel.getSpecs(this.serverSettings).then(specs => {
            if (!coreutils_1.JSONExt.deepEqual(specs, this._specs)) {
                this._specs = specs;
                this._specsChanged.emit(specs);
            }
        });
    }
    /**
     * Refresh the running sessions.
     */
    _refreshRunning() {
        return kernel_1.Kernel.listRunning(this.serverSettings).then(models => {
            this._isReady = true;
            if (!coreutils_1.JSONExt.deepEqual(models, this._models)) {
                let ids = models.map(r => r.id);
                let toRemove = [];
                this._kernels.forEach(k => {
                    if (ids.indexOf(k.id) === -1) {
                        k.dispose();
                        toRemove.push(k);
                    }
                });
                toRemove.forEach(s => {
                    this._kernels.delete(s);
                });
                this._models = models.slice();
                this._runningChanged.emit(models);
            }
        });
    }
}
exports.KernelManager = KernelManager;
