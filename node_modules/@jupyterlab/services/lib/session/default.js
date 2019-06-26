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
const coreutils_1 = require("@jupyterlab/coreutils");
const algorithm_1 = require("@phosphor/algorithm");
const signaling_1 = require("@phosphor/signaling");
const kernel_1 = require("../kernel");
const __1 = require("..");
const validate = __importStar(require("./validate"));
/**
 * The url for the session service.
 */
const SESSION_SERVICE_URL = 'api/sessions';
/**
 * Session object for accessing the session REST api. The session
 * should be used to start kernels and then shut them down -- for
 * all other operations, the kernel object should be used.
 */
class DefaultSession {
    /**
     * Construct a new session.
     */
    constructor(options, id, kernel) {
        this._id = '';
        this._path = '';
        this._name = '';
        this._type = '';
        this._isDisposed = false;
        this._updating = false;
        this._kernelChanged = new signaling_1.Signal(this);
        this._statusChanged = new signaling_1.Signal(this);
        this._iopubMessage = new signaling_1.Signal(this);
        this._unhandledMessage = new signaling_1.Signal(this);
        this._anyMessage = new signaling_1.Signal(this);
        this._propertyChanged = new signaling_1.Signal(this);
        this._terminated = new signaling_1.Signal(this);
        this._id = id;
        this._path = options.path;
        this._type = options.type || 'file';
        this._name = options.name || '';
        this.serverSettings =
            options.serverSettings || __1.ServerConnection.makeSettings();
        Private.addRunning(this);
        this.setupKernel(kernel);
    }
    /**
     * A signal emitted when the session is shut down.
     */
    get terminated() {
        return this._terminated;
    }
    /**
     * A signal emitted when the kernel changes.
     */
    get kernelChanged() {
        return this._kernelChanged;
    }
    /**
     * A signal emitted when the kernel status changes.
     */
    get statusChanged() {
        return this._statusChanged;
    }
    /**
     * A signal emitted for a kernel messages.
     */
    get iopubMessage() {
        return this._iopubMessage;
    }
    /**
     * A signal emitted for an unhandled kernel message.
     */
    get unhandledMessage() {
        return this._unhandledMessage;
    }
    /**
     * A signal emitted for any kernel message.
     *
     * Note: The behavior is undefined if the message is modified
     * during message handling. As such, it should be treated as read-only.
     */
    get anyMessage() {
        return this._anyMessage;
    }
    /**
     * A signal emitted when a session property changes.
     */
    get propertyChanged() {
        return this._propertyChanged;
    }
    /**
     * Get the session id.
     */
    get id() {
        return this._id;
    }
    /**
     * Get the session kernel object.
     *
     * #### Notes
     * This is a read-only property, and can be altered by [changeKernel].
     */
    get kernel() {
        return this._kernel;
    }
    /**
     * Get the session path.
     */
    get path() {
        return this._path;
    }
    /**
     * Get the session type.
     */
    get type() {
        return this._type;
    }
    /**
     * Get the session name.
     */
    get name() {
        return this._name;
    }
    /**
     * Get the model associated with the session.
     */
    get model() {
        return {
            id: this.id,
            kernel: this.kernel.model,
            path: this._path,
            type: this._type,
            name: this._name
        };
    }
    /**
     * The current status of the session.
     *
     * #### Notes
     * This is a delegate to the kernel status.
     */
    get status() {
        return this._kernel ? this._kernel.status : 'dead';
    }
    /**
     * Test whether the session has been disposed.
     */
    get isDisposed() {
        return this._isDisposed === true;
    }
    /**
     * Clone the current session with a new clientId.
     */
    clone() {
        const kernel = kernel_1.Kernel.connectTo(this.kernel.model, this.serverSettings);
        return new DefaultSession({
            path: this._path,
            name: this._name,
            type: this._type,
            serverSettings: this.serverSettings
        }, this._id, kernel);
    }
    /**
     * Update the session based on a session model from the server.
     */
    update(model) {
        // Avoid a race condition if we are waiting for a REST call return.
        if (this._updating) {
            return;
        }
        let oldModel = this.model;
        this._path = model.path;
        this._name = model.name;
        this._type = model.type;
        if (this._kernel.isDisposed || model.kernel.id !== this._kernel.id) {
            let newValue = kernel_1.Kernel.connectTo(model.kernel, this.serverSettings);
            let oldValue = this._kernel;
            this.setupKernel(newValue);
            this._kernelChanged.emit({ oldValue, newValue });
            this._handleModelChange(oldModel);
            return;
        }
        this._handleModelChange(oldModel);
    }
    /**
     * Dispose of the resources held by the session.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._kernel.dispose();
        this._statusChanged.emit('dead');
        this._terminated.emit(void 0);
        Private.removeRunning(this);
        signaling_1.Signal.clearData(this);
    }
    /**
     * Change the session path.
     *
     * @param path - The new session path.
     *
     * @returns A promise that resolves when the session has renamed.
     *
     * #### Notes
     * This uses the Jupyter REST API, and the response is validated.
     * The promise is fulfilled on a valid response and rejected otherwise.
     */
    setPath(path) {
        if (this.isDisposed) {
            return Promise.reject(new Error('Session is disposed'));
        }
        let data = JSON.stringify({ path });
        return this._patch(data).then(() => {
            return void 0;
        });
    }
    /**
     * Change the session name.
     */
    setName(name) {
        if (this.isDisposed) {
            return Promise.reject(new Error('Session is disposed'));
        }
        let data = JSON.stringify({ name });
        return this._patch(data).then(() => {
            return void 0;
        });
    }
    /**
     * Change the session type.
     */
    setType(type) {
        if (this.isDisposed) {
            return Promise.reject(new Error('Session is disposed'));
        }
        let data = JSON.stringify({ type });
        return this._patch(data).then(() => {
            return void 0;
        });
    }
    /**
     * Change the kernel.
     *
     * @params options - The name or id of the new kernel.
     *
     * #### Notes
     * This shuts down the existing kernel and creates a new kernel,
     * keeping the existing session ID and session path.
     */
    changeKernel(options) {
        if (this.isDisposed) {
            return Promise.reject(new Error('Session is disposed'));
        }
        let data = JSON.stringify({ kernel: options });
        this._kernel.dispose();
        this._statusChanged.emit('restarting');
        return this._patch(data).then(() => this.kernel);
    }
    /**
     * Kill the kernel and shutdown the session.
     *
     * @returns - The promise fulfilled on a valid response from the server.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/sessions), and validates the response.
     * Disposes of the session and emits a [sessionDied] signal on success.
     */
    shutdown() {
        if (this.isDisposed) {
            return Promise.reject(new Error('Session is disposed'));
        }
        return Private.shutdownSession(this.id, this.serverSettings);
    }
    /**
     * Handle connections to a kernel.  This method is not meant to be
     * subclassed.
     */
    setupKernel(kernel) {
        this._kernel = kernel;
        kernel.statusChanged.connect(this.onKernelStatus, this);
        kernel.unhandledMessage.connect(this.onUnhandledMessage, this);
        kernel.iopubMessage.connect(this.onIOPubMessage, this);
        kernel.anyMessage.connect(this.onAnyMessage, this);
    }
    /**
     * Handle to changes in the Kernel status.
     */
    onKernelStatus(sender, state) {
        this._statusChanged.emit(state);
    }
    /**
     * Handle iopub kernel messages.
     */
    onIOPubMessage(sender, msg) {
        this._iopubMessage.emit(msg);
    }
    /**
     * Handle unhandled kernel messages.
     */
    onUnhandledMessage(sender, msg) {
        this._unhandledMessage.emit(msg);
    }
    /**
     * Handle any kernel messages.
     */
    onAnyMessage(sender, args) {
        this._anyMessage.emit(args);
    }
    /**
     * Send a PATCH to the server, updating the session path or the kernel.
     */
    _patch(body) {
        this._updating = true;
        let settings = this.serverSettings;
        let url = Private.getSessionUrl(settings.baseUrl, this._id);
        let init = {
            method: 'PATCH',
            body
        };
        return __1.ServerConnection.makeRequest(url, init, settings)
            .then(response => {
            this._updating = false;
            if (response.status !== 200) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            return response.json();
        })
            .then(data => {
            let model = validate.validateModel(data);
            return Private.updateFromServer(model, settings.baseUrl);
        }, error => {
            this._updating = false;
            throw error;
        });
    }
    /**
     * Handle a change to the model.
     */
    _handleModelChange(oldModel) {
        if (oldModel.name !== this._name) {
            this._propertyChanged.emit('name');
        }
        if (oldModel.type !== this._type) {
            this._propertyChanged.emit('type');
        }
        if (oldModel.path !== this._path) {
            this._propertyChanged.emit('path');
        }
    }
}
exports.DefaultSession = DefaultSession;
/**
 * The namespace for `DefaultSession` statics.
 */
(function (DefaultSession) {
    /**
     * List the running sessions.
     */
    function listRunning(settings) {
        return Private.listRunning(settings);
    }
    DefaultSession.listRunning = listRunning;
    /**
     * Start a new session.
     */
    function startNew(options) {
        return Private.startNew(options);
    }
    DefaultSession.startNew = startNew;
    /**
     * Find a session by id.
     */
    function findById(id, settings) {
        return Private.findById(id, settings);
    }
    DefaultSession.findById = findById;
    /**
     * Find a session by path.
     */
    function findByPath(path, settings) {
        return Private.findByPath(path, settings);
    }
    DefaultSession.findByPath = findByPath;
    /**
     * Connect to a running session.
     */
    function connectTo(model, settings) {
        return Private.connectTo(model, settings);
    }
    DefaultSession.connectTo = connectTo;
    /**
     * Shut down a session by id.
     */
    function shutdown(id, settings) {
        return Private.shutdownSession(id, settings);
    }
    DefaultSession.shutdown = shutdown;
    /**
     * Shut down all sessions.
     *
     * @param settings - The server settings to use.
     *
     * @returns A promise that resolves when all the sessions are shut down.
     */
    function shutdownAll(settings) {
        return Private.shutdownAll(settings);
    }
    DefaultSession.shutdownAll = shutdownAll;
})(DefaultSession = exports.DefaultSession || (exports.DefaultSession = {}));
/**
 * A namespace for session private data.
 */
var Private;
(function (Private) {
    /**
     * The running sessions mapped by base url.
     */
    const runningSessions = new Map();
    /**
     * Add a session to the running sessions.
     */
    function addRunning(session) {
        let running = runningSessions.get(session.serverSettings.baseUrl) || [];
        running.push(session);
        runningSessions.set(session.serverSettings.baseUrl, running);
    }
    Private.addRunning = addRunning;
    /**
     * Remove a session from the running sessions.
     */
    function removeRunning(session) {
        let running = runningSessions.get(session.serverSettings.baseUrl);
        if (running) {
            algorithm_1.ArrayExt.removeFirstOf(running, session);
        }
    }
    Private.removeRunning = removeRunning;
    /**
     * Connect to a running session.
     */
    function connectTo(model, settings) {
        settings = settings || __1.ServerConnection.makeSettings();
        let running = runningSessions.get(settings.baseUrl) || [];
        let session = algorithm_1.find(running, value => value.id === model.id);
        if (session) {
            return session.clone();
        }
        return createSession(model, settings);
    }
    Private.connectTo = connectTo;
    /**
     * Create a Session object.
     *
     * @returns - A promise that resolves with a started session.
     */
    function createSession(model, settings) {
        settings = settings || __1.ServerConnection.makeSettings();
        let kernel = kernel_1.Kernel.connectTo(model.kernel, settings);
        return new DefaultSession({
            path: model.path,
            type: model.type,
            name: model.name,
            serverSettings: settings
        }, model.id, kernel);
    }
    Private.createSession = createSession;
    /**
     * Find a session by id.
     */
    function findById(id, settings) {
        settings = settings || __1.ServerConnection.makeSettings();
        let running = runningSessions.get(settings.baseUrl) || [];
        let session = algorithm_1.find(running, value => value.id === id);
        if (session) {
            return Promise.resolve(session.model);
        }
        return getSessionModel(id, settings).catch(() => {
            throw new Error(`No running session for id: ${id}`);
        });
    }
    Private.findById = findById;
    /**
     * Find a session by path.
     */
    function findByPath(path, settings) {
        settings = settings || __1.ServerConnection.makeSettings();
        let running = runningSessions.get(settings.baseUrl) || [];
        let session = algorithm_1.find(running, value => value.path === path);
        if (session) {
            return Promise.resolve(session.model);
        }
        return listRunning(settings).then(models => {
            let model = algorithm_1.find(models, value => {
                return value.path === path;
            });
            if (model) {
                return model;
            }
            throw new Error(`No running session for path: ${path}`);
        });
    }
    Private.findByPath = findByPath;
    /**
     * Get a full session model from the server by session id string.
     */
    function getSessionModel(id, settings) {
        settings = settings || __1.ServerConnection.makeSettings();
        let url = getSessionUrl(settings.baseUrl, id);
        return __1.ServerConnection.makeRequest(url, {}, settings)
            .then(response => {
            if (response.status !== 200) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            return response.json();
        })
            .then(data => {
            const model = validate.validateModel(data);
            return updateFromServer(model, settings.baseUrl);
        });
    }
    Private.getSessionModel = getSessionModel;
    /**
     * Get a session url.
     */
    function getSessionUrl(baseUrl, id) {
        return coreutils_1.URLExt.join(baseUrl, SESSION_SERVICE_URL, id);
    }
    Private.getSessionUrl = getSessionUrl;
    /**
     * Kill the sessions by id.
     */
    function killSessions(id, baseUrl) {
        let running = runningSessions.get(baseUrl) || [];
        algorithm_1.each(running.slice(), session => {
            if (session.id === id) {
                session.dispose();
            }
        });
    }
    /**
     * List the running sessions.
     */
    function listRunning(settings) {
        settings = settings || __1.ServerConnection.makeSettings();
        let url = coreutils_1.URLExt.join(settings.baseUrl, SESSION_SERVICE_URL);
        return __1.ServerConnection.makeRequest(url, {}, settings)
            .then(response => {
            if (response.status !== 200) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            return response.json();
        })
            .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Invalid Session list');
            }
            for (let i = 0; i < data.length; i++) {
                data[i] = validate.validateModel(data[i]);
            }
            return updateRunningSessions(data, settings.baseUrl);
        });
    }
    Private.listRunning = listRunning;
    /**
     * Shut down a session by id.
     */
    function shutdownSession(id, settings) {
        settings = settings || __1.ServerConnection.makeSettings();
        let url = getSessionUrl(settings.baseUrl, id);
        let init = { method: 'DELETE' };
        return __1.ServerConnection.makeRequest(url, init, settings).then(response => {
            if (response.status === 404) {
                response.json().then(data => {
                    let msg = data.message || `The session "${id}"" does not exist on the server`;
                    console.warn(msg);
                });
            }
            else if (response.status === 410) {
                throw new __1.ServerConnection.ResponseError(response, 'The kernel was deleted but the session was not');
            }
            else if (response.status !== 204) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            killSessions(id, settings.baseUrl);
        });
    }
    Private.shutdownSession = shutdownSession;
    /**
     * Shut down all sessions.
     */
    function shutdownAll(settings) {
        settings = settings || __1.ServerConnection.makeSettings();
        return listRunning(settings).then(running => {
            algorithm_1.each(running, s => {
                shutdownSession(s.id, settings);
            });
        });
    }
    Private.shutdownAll = shutdownAll;
    /**
     * Start a new session.
     */
    function startNew(options) {
        if (options.path === void 0) {
            return Promise.reject(new Error('Must specify a path'));
        }
        return startSession(options).then(model => {
            return createSession(model, options.serverSettings);
        });
    }
    Private.startNew = startNew;
    /**
     * Create a new session, or return an existing session if
     * the session path already exists
     */
    function startSession(options) {
        let settings = options.serverSettings || __1.ServerConnection.makeSettings();
        let model = {
            kernel: { name: options.kernelName, id: options.kernelId },
            path: options.path,
            type: options.type || '',
            name: options.name || ''
        };
        let url = coreutils_1.URLExt.join(settings.baseUrl, SESSION_SERVICE_URL);
        let init = {
            method: 'POST',
            body: JSON.stringify(model)
        };
        return __1.ServerConnection.makeRequest(url, init, settings)
            .then(response => {
            if (response.status !== 201) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            return response.json();
        })
            .then(data => {
            const model = validate.validateModel(data);
            return updateFromServer(model, settings.baseUrl);
        });
    }
    Private.startSession = startSession;
    /**
     * Update the running sessions given an updated session Id.
     */
    function updateFromServer(model, baseUrl) {
        let running = runningSessions.get(baseUrl) || [];
        algorithm_1.each(running.slice(), session => {
            if (session.id === model.id) {
                session.update(model);
            }
        });
        return model;
    }
    Private.updateFromServer = updateFromServer;
    /**
     * Update the running sessions based on new data from the server.
     */
    function updateRunningSessions(sessions, baseUrl) {
        let running = runningSessions.get(baseUrl) || [];
        algorithm_1.each(running.slice(), session => {
            let updated = algorithm_1.find(sessions, sId => {
                if (session.id === sId.id) {
                    session.update(sId);
                    return true;
                }
                return false;
            });
            // If session is no longer running on disk, emit dead signal.
            if (!updated && session.status !== 'dead') {
                session.dispose();
            }
        });
        return sessions;
    }
    Private.updateRunningSessions = updateRunningSessions;
})(Private || (Private = {}));
