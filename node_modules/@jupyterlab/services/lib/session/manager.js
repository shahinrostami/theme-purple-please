"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const algorithm_1 = require("@phosphor/algorithm");
const coreutils_1 = require("@phosphor/coreutils");
const signaling_1 = require("@phosphor/signaling");
const kernel_1 = require("../kernel");
const __1 = require("..");
const session_1 = require("./session");
/**
 * An implementation of a session manager.
 */
class SessionManager {
    /**
     * Construct a new session manager.
     *
     * @param options - The default options for each session.
     */
    constructor(options = {}) {
        this._isDisposed = false;
        this._models = [];
        this._sessions = new Set();
        this._specs = null;
        this._modelsTimer = -1;
        this._specsTimer = -1;
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
     * A signal emitted when the kernel specs change.
     */
    get specsChanged() {
        return this._specsChanged;
    }
    /**
     * A signal emitted when the running sessions change.
     */
    get runningChanged() {
        return this._runningChanged;
    }
    /**
     * Test whether the manager is disposed.
     */
    get isDisposed() {
        return this._isDisposed;
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
        return this._specs !== null;
    }
    /**
     * A promise that fulfills when the manager is ready.
     */
    get ready() {
        return this._readyPromise;
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
        this._models.length = 0;
    }
    /**
     * Create an iterator over the most recent running sessions.
     *
     * @returns A new iterator over the running sessions.
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
     * Force a refresh of the running sessions.
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
     * Start a new session.  See also [[startNewSession]].
     *
     * @param options - Overrides for the default options, must include a
     *   `'path'`.
     */
    startNew(options) {
        let serverSettings = this.serverSettings;
        return session_1.Session.startNew(Object.assign({}, options, { serverSettings })).then(session => {
            this._onStarted(session);
            return session;
        });
    }
    /**
     * Find a session associated with a path and stop it if it is the only session
     * using that kernel.
     *
     * @param path - The path in question.
     *
     * @returns A promise that resolves when the relevant sessions are stopped.
     */
    stopIfNeeded(path) {
        return session_1.Session.listRunning(this.serverSettings)
            .then(sessions => {
            const matches = sessions.filter(value => value.path === path);
            if (matches.length === 1) {
                const id = matches[0].id;
                return this.shutdown(id).catch(() => {
                    /* no-op */
                });
            }
        })
            .catch(() => Promise.resolve(void 0)); // Always succeed.
    }
    /**
     * Find a session by id.
     */
    findById(id) {
        return session_1.Session.findById(id, this.serverSettings);
    }
    /**
     * Find a session by path.
     */
    findByPath(path) {
        return session_1.Session.findByPath(path, this.serverSettings);
    }
    /*
     * Connect to a running session.  See also [[connectToSession]].
     */
    connectTo(model) {
        const session = session_1.Session.connectTo(model, this.serverSettings);
        this._onStarted(session);
        return session;
    }
    /**
     * Shut down a session by id.
     */
    shutdown(id) {
        let index = algorithm_1.ArrayExt.findFirstIndex(this._models, value => value.id === id);
        if (index === -1) {
            return;
        }
        // Proactively remove the model.
        this._models.splice(index, 1);
        this._runningChanged.emit(this._models.slice());
        return session_1.Session.shutdown(id, this.serverSettings).then(() => {
            let toRemove = [];
            this._sessions.forEach(s => {
                if (s.id === id) {
                    s.dispose();
                    toRemove.push(s);
                }
            });
            toRemove.forEach(s => {
                this._sessions.delete(s);
            });
        });
    }
    /**
     * Shut down all sessions.
     *
     * @returns A promise that resolves when all of the sessions are shut down.
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
                return session_1.Session.shutdown(model.id, this.serverSettings).then(() => {
                    let toRemove = [];
                    this._sessions.forEach(s => {
                        s.dispose();
                        toRemove.push(s);
                    });
                    toRemove.forEach(s => {
                        this._sessions.delete(s);
                    });
                });
            })).then(() => {
                return undefined;
            });
        });
    }
    /**
     * Handle a session terminating.
     */
    _onTerminated(id) {
        let index = algorithm_1.ArrayExt.findFirstIndex(this._models, value => value.id === id);
        if (index !== -1) {
            this._models.splice(index, 1);
            this._runningChanged.emit(this._models.slice());
        }
    }
    /**
     * Handle a session starting.
     */
    _onStarted(session) {
        let id = session.id;
        let index = algorithm_1.ArrayExt.findFirstIndex(this._models, value => value.id === id);
        this._sessions.add(session);
        if (index === -1) {
            this._models.push(session.model);
            this._runningChanged.emit(this._models.slice());
        }
        session.terminated.connect(s => {
            this._onTerminated(id);
        });
        session.propertyChanged.connect((sender, prop) => {
            this._onChanged(session.model);
        });
        session.kernelChanged.connect(() => {
            this._onChanged(session.model);
        });
    }
    /**
     * Handle a change to a session.
     */
    _onChanged(model) {
        let index = algorithm_1.ArrayExt.findFirstIndex(this._models, value => value.id === model.id);
        if (index !== -1) {
            this._models[index] = model;
            this._runningChanged.emit(this._models.slice());
        }
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
        return session_1.Session.listRunning(this.serverSettings).then(models => {
            if (!coreutils_1.JSONExt.deepEqual(models, this._models)) {
                let ids = models.map(r => r.id);
                let toRemove = [];
                this._sessions.forEach(s => {
                    if (ids.indexOf(s.id) === -1) {
                        s.dispose();
                        toRemove.push(s);
                    }
                });
                toRemove.forEach(s => {
                    this._sessions.delete(s);
                });
                this._models = models.slice();
                this._runningChanged.emit(models);
            }
        });
    }
}
exports.SessionManager = SessionManager;
