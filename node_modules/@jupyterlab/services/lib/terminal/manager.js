"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const algorithm_1 = require("@phosphor/algorithm");
const coreutils_1 = require("@phosphor/coreutils");
const signaling_1 = require("@phosphor/signaling");
const __1 = require("..");
const terminal_1 = require("./terminal");
/**
 * A terminal session manager.
 */
class TerminalManager {
    /**
     * Construct a new terminal manager.
     */
    constructor(options = {}) {
        this._models = [];
        this._sessions = new Set();
        this._isDisposed = false;
        this._isReady = false;
        this._refreshTimer = -1;
        this._runningChanged = new signaling_1.Signal(this);
        this.serverSettings =
            options.serverSettings || __1.ServerConnection.makeSettings();
        // Set up state handling if terminals are available.
        if (terminal_1.TerminalSession.isAvailable()) {
            // Initialize internal data.
            this._readyPromise = this._refreshRunning();
            // Set up polling.
            this._refreshTimer = setInterval(() => {
                if (typeof document !== 'undefined' && document.hidden) {
                    // Don't poll when nobody's looking.
                    return;
                }
                this._refreshRunning();
            }, 10000);
        }
    }
    /**
     * A signal emitted when the running terminals change.
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
     * Test whether the manager is ready.
     */
    get isReady() {
        return this._isReady;
    }
    /**
     * Dispose of the resources used by the manager.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        clearInterval(this._refreshTimer);
        signaling_1.Signal.clearData(this);
        this._models = [];
    }
    /**
     * A promise that fulfills when the manager is ready.
     */
    get ready() {
        return this._readyPromise || Promise.reject('Terminals unavailable');
    }
    /**
     * Whether the terminal service is available.
     */
    isAvailable() {
        return terminal_1.TerminalSession.isAvailable();
    }
    /**
     * Create an iterator over the most recent running terminals.
     *
     * @returns A new iterator over the running terminals.
     */
    running() {
        return algorithm_1.iter(this._models);
    }
    /**
     * Create a new terminal session.
     *
     * @param options - The options used to connect to the session.
     *
     * @returns A promise that resolves with the terminal instance.
     *
     * #### Notes
     * The manager `serverSettings` will be used unless overridden in the
     * options.
     */
    startNew(options) {
        return terminal_1.TerminalSession.startNew(this._getOptions(options)).then(session => {
            this._onStarted(session);
            return session;
        });
    }
    /*
     * Connect to a running session.
     *
     * @param name - The name of the target session.
     *
     * @param options - The options used to connect to the session.
     *
     * @returns A promise that resolves with the new session instance.
     *
     * #### Notes
     * The manager `serverSettings` will be used unless overridden in the
     * options.
     */
    connectTo(name, options) {
        return terminal_1.TerminalSession.connectTo(name, this._getOptions(options)).then(session => {
            this._onStarted(session);
            return session;
        });
    }
    /**
     * Shut down a terminal session by name.
     */
    shutdown(name) {
        let index = algorithm_1.ArrayExt.findFirstIndex(this._models, value => value.name === name);
        if (index === -1) {
            return;
        }
        // Proactively remove the model.
        this._models.splice(index, 1);
        this._runningChanged.emit(this._models.slice());
        return terminal_1.TerminalSession.shutdown(name, this.serverSettings).then(() => {
            let toRemove = [];
            this._sessions.forEach(s => {
                if (s.name === name) {
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
     * Shut down all terminal sessions.
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
                return terminal_1.TerminalSession.shutdown(model.name, this.serverSettings).then(() => {
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
     * Handle a session terminating.
     */
    _onTerminated(name) {
        let index = algorithm_1.ArrayExt.findFirstIndex(this._models, value => value.name === name);
        if (index !== -1) {
            this._models.splice(index, 1);
            this._runningChanged.emit(this._models.slice());
        }
    }
    /**
     * Handle a session starting.
     */
    _onStarted(session) {
        let name = session.name;
        this._sessions.add(session);
        let index = algorithm_1.ArrayExt.findFirstIndex(this._models, value => value.name === name);
        if (index === -1) {
            this._models.push(session.model);
            this._runningChanged.emit(this._models.slice());
        }
        session.terminated.connect(() => {
            this._onTerminated(name);
        });
    }
    /**
     * Refresh the running sessions.
     */
    _refreshRunning() {
        return terminal_1.TerminalSession.listRunning(this.serverSettings).then(models => {
            this._isReady = true;
            if (!coreutils_1.JSONExt.deepEqual(models, this._models)) {
                let names = models.map(r => r.name);
                let toRemove = [];
                this._sessions.forEach(s => {
                    if (names.indexOf(s.name) === -1) {
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
    /**
     * Get a set of options to pass.
     */
    _getOptions(options = {}) {
        return Object.assign({}, options, { serverSettings: this.serverSettings });
    }
}
exports.TerminalManager = TerminalManager;
