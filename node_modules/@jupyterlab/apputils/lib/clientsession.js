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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const coreutils_2 = require("@phosphor/coreutils");
const algorithm_1 = require("@phosphor/algorithm");
const coreutils_3 = require("@phosphor/coreutils");
const signaling_1 = require("@phosphor/signaling");
const widgets_1 = require("@phosphor/widgets");
const React = __importStar(require("react"));
const dialog_1 = require("./dialog");
/**
 * The default implementation of client session object.
 */
class ClientSession {
    /**
     * Construct a new client session.
     */
    constructor(options) {
        this._path = '';
        this._name = '';
        this._type = '';
        this._prevKernelName = '';
        this._isDisposed = false;
        this._session = null;
        this._ready = new coreutils_3.PromiseDelegate();
        this._initializing = false;
        this._isReady = false;
        this._terminated = new signaling_1.Signal(this);
        this._kernelChanged = new signaling_1.Signal(this);
        this._statusChanged = new signaling_1.Signal(this);
        this._iopubMessage = new signaling_1.Signal(this);
        this._unhandledMessage = new signaling_1.Signal(this);
        this._propertyChanged = new signaling_1.Signal(this);
        this._dialog = null;
        this._busyDisposable = null;
        this.manager = options.manager;
        this._path = options.path || coreutils_2.UUID.uuid4();
        this._type = options.type || '';
        this._name = options.name || '';
        this._setBusy = options.setBusy;
        this._kernelPreference = options.kernelPreference || {};
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
     * A signal emitted when the status changes.
     */
    get statusChanged() {
        return this._statusChanged;
    }
    /**
     * A signal emitted for iopub kernel messages.
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
     * A signal emitted when a session property changes.
     */
    get propertyChanged() {
        return this._propertyChanged;
    }
    /**
     * The current kernel of the session.
     */
    get kernel() {
        return this._session ? this._session.kernel : null;
    }
    /**
     * The current path of the session.
     */
    get path() {
        return this._path;
    }
    /**
     * The current name of the session.
     */
    get name() {
        return this._name;
    }
    /**
     * The type of the client session.
     */
    get type() {
        return this._type;
    }
    /**
     * The kernel preference of the session.
     */
    get kernelPreference() {
        return this._kernelPreference;
    }
    set kernelPreference(value) {
        this._kernelPreference = value;
    }
    /**
     * The current status of the session.
     */
    get status() {
        if (!this.isReady) {
            return 'starting';
        }
        return this._session ? this._session.status : 'dead';
    }
    /**
     * Whether the session is ready.
     */
    get isReady() {
        return this._isReady;
    }
    /**
     * A promise that is fulfilled when the session is ready.
     */
    get ready() {
        return this._ready.promise;
    }
    /**
     * The display name of the current kernel.
     */
    get kernelDisplayName() {
        let kernel = this.kernel;
        if (!kernel) {
            return 'No Kernel!';
        }
        let specs = this.manager.specs;
        if (!specs) {
            return 'Unknown!';
        }
        let spec = specs.kernelspecs[kernel.name];
        return spec ? spec.display_name : kernel.name;
    }
    /**
     * Test whether the context is disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Dispose of the resources held by the context.
     */
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        if (this._session) {
            this._session = null;
        }
        if (this._dialog) {
            this._dialog.dispose();
        }
        signaling_1.Signal.clearData(this);
    }
    /**
     * Change the current kernel associated with the document.
     */
    changeKernel(options) {
        return this.initialize().then(() => {
            if (this.isDisposed) {
                return Promise.reject('Disposed');
            }
            return this._changeKernel(options);
        });
    }
    /**
     * Select a kernel for the session.
     */
    selectKernel() {
        return this.initialize().then(() => {
            if (this.isDisposed) {
                return Promise.reject('Disposed');
            }
            return this._selectKernel(true);
        });
    }
    /**
     * Kill the kernel and shutdown the session.
     *
     * @returns A promise that resolves when the session is shut down.
     */
    shutdown() {
        const session = this._session;
        if (this.isDisposed || !session) {
            return Promise.resolve();
        }
        this._session = null;
        return session.shutdown();
    }
    /**
     * Restart the session.
     *
     * @returns A promise that resolves with whether the kernel has restarted.
     *
     * #### Notes
     * If there is a running kernel, present a dialog.
     * If there is no kernel, we start a kernel with the last run
     * kernel name and resolves with `true`.
     */
    restart() {
        return this.initialize().then(() => {
            if (this.isDisposed) {
                return Promise.reject('session already disposed');
            }
            let kernel = this.kernel;
            if (!kernel) {
                if (this._prevKernelName) {
                    return this.changeKernel({ name: this._prevKernelName }).then(() => true);
                }
                // Bail if there is no previous kernel to start.
                return Promise.reject('No kernel to restart');
            }
            return ClientSession.restartKernel(kernel);
        });
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
        if (this.isDisposed || this._path === path) {
            return Promise.resolve();
        }
        this._path = path;
        if (this._session) {
            return this._session.setPath(path);
        }
        this._propertyChanged.emit('path');
        return Promise.resolve();
    }
    /**
     * Change the session name.
     */
    setName(name) {
        if (this.isDisposed || this._name === name) {
            return Promise.resolve();
        }
        this._name = name;
        if (this._session) {
            return this._session.setName(name);
        }
        this._propertyChanged.emit('name');
        return Promise.resolve();
    }
    /**
     * Change the session type.
     */
    setType(type) {
        if (this.isDisposed || this._type === type) {
            return Promise.resolve();
        }
        this._type = type;
        if (this._session) {
            return this._session.setType(name);
        }
        this._propertyChanged.emit('type');
        return Promise.resolve();
    }
    /**
     * Initialize the session.
     *
     * #### Notes
     * If a server session exists on the current path, we will connect to it.
     * If preferences include disabling `canStart` or `shouldStart`, no
     * server session will be started.
     * If a kernel id is given, we attempt to start a session with that id.
     * If a default kernel is available, we connect to it.
     * Otherwise we ask the user to select a kernel.
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._initializing || this._isReady) {
                return this._ready.promise;
            }
            this._initializing = true;
            let manager = this.manager;
            yield manager.ready;
            let model = algorithm_1.find(manager.running(), item => {
                return item.path === this._path;
            });
            if (model) {
                try {
                    let session = manager.connectTo(model);
                    this._handleNewSession(session);
                }
                catch (err) {
                    this._handleSessionError(err);
                }
            }
            yield this._startIfNecessary();
            this._isReady = true;
            this._ready.resolve(undefined);
        });
    }
    /**
     * Start the session if necessary.
     */
    _startIfNecessary() {
        let preference = this.kernelPreference;
        if (this.isDisposed ||
            this.kernel ||
            preference.shouldStart === false ||
            preference.canStart === false) {
            return Promise.resolve();
        }
        // Try to use an existing kernel.
        if (preference.id) {
            return this._changeKernel({ id: preference.id })
                .then(() => undefined)
                .catch(() => this._selectKernel(false));
        }
        let name = ClientSession.getDefaultKernel({
            specs: this.manager.specs,
            sessions: this.manager.running(),
            preference
        });
        if (name) {
            return this._changeKernel({ name })
                .then(() => undefined)
                .catch(() => this._selectKernel(false));
        }
        return this._selectKernel(false);
    }
    /**
     * Change the kernel.
     */
    _changeKernel(options) {
        if (this.isDisposed) {
            return Promise.reject('Disposed');
        }
        let session = this._session;
        if (session) {
            return session.changeKernel(options);
        }
        else {
            return this._startSession(options);
        }
    }
    /**
     * Select a kernel.
     *
     * @param cancelable: whether the dialog should have a cancel button.
     */
    _selectKernel(cancelable) {
        if (this.isDisposed) {
            return Promise.resolve();
        }
        const buttons = cancelable
            ? [dialog_1.Dialog.cancelButton(), dialog_1.Dialog.okButton({ label: 'SELECT' })]
            : [dialog_1.Dialog.okButton({ label: 'SELECT' })];
        let dialog = (this._dialog = new dialog_1.Dialog({
            title: 'Select Kernel',
            body: new Private.KernelSelector(this),
            buttons
        }));
        return dialog
            .launch()
            .then(result => {
            if (this.isDisposed || !result.button.accept) {
                return;
            }
            let model = result.value;
            if (model === null && this._session) {
                return this.shutdown().then(() => {
                    this._kernelChanged.emit({ oldValue: null, newValue: null });
                });
            }
            if (model) {
                return this._changeKernel(model).then(() => undefined);
            }
        })
            .then(() => {
            this._dialog = null;
        });
    }
    /**
     * Start a session and set up its signals.
     */
    _startSession(model) {
        if (this.isDisposed) {
            return Promise.reject('Session is disposed.');
        }
        return this.manager
            .startNew({
            path: this._path,
            type: this._type,
            name: this._name,
            kernelName: model ? model.name : undefined,
            kernelId: model ? model.id : undefined
        })
            .then(session => {
            return this._handleNewSession(session);
        })
            .catch(err => {
            this._handleSessionError(err);
            return Promise.reject(err);
        });
    }
    /**
     * Handle a new session object.
     */
    _handleNewSession(session) {
        if (this.isDisposed) {
            throw Error('Disposed');
        }
        if (this._session) {
            this._session.dispose();
        }
        this._session = session;
        if (session.path !== this._path) {
            this._path = session.path;
            this._propertyChanged.emit('path');
        }
        if (session.name !== this._name) {
            this._name = session.name;
            this._propertyChanged.emit('name');
        }
        if (session.type !== this._type) {
            this._type = session.type;
            this._propertyChanged.emit('type');
        }
        session.terminated.connect(this._onTerminated, this);
        session.propertyChanged.connect(this._onPropertyChanged, this);
        session.kernelChanged.connect(this._onKernelChanged, this);
        session.statusChanged.connect(this._onStatusChanged, this);
        session.iopubMessage.connect(this._onIopubMessage, this);
        session.unhandledMessage.connect(this._onUnhandledMessage, this);
        this._prevKernelName = session.kernel.name;
        // The session kernel was disposed above when the session was disposed, so
        // the oldValue should be null.
        this._kernelChanged.emit({ oldValue: null, newValue: session.kernel });
        return session.kernel;
    }
    /**
     * Handle an error in session startup.
     */
    _handleSessionError(err) {
        return err.response
            .text()
            .then(text => {
            let message = err.message;
            try {
                message = JSON.parse(text)['traceback'];
            }
            catch (err) {
                // no-op
            }
            let dialog = (this._dialog = new dialog_1.Dialog({
                title: 'Error Starting Kernel',
                body: React.createElement("pre", null, message),
                buttons: [dialog_1.Dialog.okButton()]
            }));
            return dialog.launch();
        })
            .then(() => {
            this._dialog = null;
        });
    }
    /**
     * Handle a session termination.
     */
    _onTerminated() {
        let kernel = this.kernel;
        if (this._session) {
            this._session.dispose();
        }
        this._session = null;
        this._terminated.emit(undefined);
        if (kernel) {
            this._kernelChanged.emit({ oldValue: null, newValue: null });
        }
    }
    /**
     * Handle a change to a session property.
     */
    _onPropertyChanged(sender, property) {
        switch (property) {
            case 'path':
                this._path = sender.path;
                break;
            case 'name':
                this._name = sender.name;
                break;
            default:
                this._type = sender.type;
                break;
        }
        this._propertyChanged.emit(property);
    }
    /**
     * Handle a change to the kernel.
     */
    _onKernelChanged(sender, args) {
        this._kernelChanged.emit(args);
    }
    /**
     * Handle a change to the session status.
     */
    _onStatusChanged() {
        // Set that this kernel is busy, if we haven't already
        // If we have already, and now we aren't busy, dispose
        // of the busy disposable.
        if (this._setBusy) {
            if (this.status === 'busy') {
                if (!this._busyDisposable) {
                    this._busyDisposable = this._setBusy();
                }
            }
            else {
                if (this._busyDisposable) {
                    this._busyDisposable.dispose();
                    this._busyDisposable = null;
                }
            }
        }
        this._statusChanged.emit(this.status);
    }
    /**
     * Handle an iopub message.
     */
    _onIopubMessage(sender, message) {
        this._iopubMessage.emit(message);
    }
    /**
     * Handle an unhandled message.
     */
    _onUnhandledMessage(sender, message) {
        this._unhandledMessage.emit(message);
    }
}
exports.ClientSession = ClientSession;
/**
 * A namespace for `ClientSession` statics.
 */
(function (ClientSession) {
    /**
     * Restart a kernel if the user accepts the risk.
     *
     * Returns a promise resolving with whether the kernel was restarted.
     */
    function restartKernel(kernel) {
        let restartBtn = dialog_1.Dialog.warnButton({ label: 'RESTART ' });
        return dialog_1.showDialog({
            title: 'Restart Kernel?',
            body: 'Do you want to restart the current kernel? All variables will be lost.',
            buttons: [dialog_1.Dialog.cancelButton(), restartBtn]
        }).then(result => {
            if (kernel.isDisposed) {
                return Promise.resolve(false);
            }
            if (result.button.accept) {
                return kernel.restart().then(() => {
                    return true;
                });
            }
            return false;
        });
    }
    ClientSession.restartKernel = restartKernel;
    /**
     * Get the default kernel name given select options.
     */
    function getDefaultKernel(options) {
        return Private.getDefaultKernel(options);
    }
    ClientSession.getDefaultKernel = getDefaultKernel;
    /**
     * Populate a kernel dropdown list.
     *
     * @param node - The node to populate.
     *
     * @param options - The options used to populate the kernels.
     *
     * #### Notes
     * Populates the list with separated sections:
     *   - Kernels matching the preferred language (display names).
     *   - "None" signifying no kernel.
     *   - The remaining kernels.
     *   - Sessions matching the preferred language (file names).
     *   - The remaining sessions.
     * If no preferred language is given or no kernels are found using
     * the preferred language, the default kernel is used in the first
     * section.  Kernels are sorted by display name.  Sessions display the
     * base name of the file with an ellipsis overflow and a tooltip with
     * the explicit session information.
     */
    function populateKernelSelect(node, options) {
        return Private.populateKernelSelect(node, options);
    }
    ClientSession.populateKernelSelect = populateKernelSelect;
})(ClientSession = exports.ClientSession || (exports.ClientSession = {}));
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * A widget that provides a kernel selection.
     */
    class KernelSelector extends widgets_1.Widget {
        /**
         * Create a new kernel selector widget.
         */
        constructor(session) {
            super({ node: createSelectorNode(session) });
        }
        /**
         * Get the value of the kernel selector widget.
         */
        getValue() {
            let selector = this.node.querySelector('select');
            return JSON.parse(selector.value);
        }
    }
    Private.KernelSelector = KernelSelector;
    /**
     * Create a node for a kernel selector widget.
     */
    function createSelectorNode(session) {
        // Create the dialog body.
        let body = document.createElement('div');
        let text = document.createElement('label');
        text.innerHTML = `Select kernel for: "${session.name}"`;
        body.appendChild(text);
        let options = getKernelSearch(session);
        let selector = document.createElement('select');
        ClientSession.populateKernelSelect(selector, options);
        body.appendChild(selector);
        return body;
    }
    /**
     * Get the default kernel name given select options.
     */
    function getDefaultKernel(options) {
        let { specs, preference } = options;
        let { name, language, shouldStart, canStart, autoStartDefault } = preference;
        if (!specs || shouldStart === false || canStart === false) {
            return null;
        }
        let defaultName = autoStartDefault ? specs.default : null;
        if (!name && !language) {
            return defaultName;
        }
        // Look for an exact match of a spec name.
        for (let specName in specs.kernelspecs) {
            if (specName === name) {
                return name;
            }
        }
        // Bail if there is no language.
        if (!language) {
            return defaultName;
        }
        // Check for a single kernel matching the language.
        let matches = [];
        for (let specName in specs.kernelspecs) {
            let kernelLanguage = specs.kernelspecs[specName].language;
            if (language === kernelLanguage) {
                matches.push(specName);
            }
        }
        if (matches.length === 1) {
            let specName = matches[0];
            console.log('No exact match found for ' +
                specName +
                ', using kernel ' +
                specName +
                ' that matches ' +
                'language=' +
                language);
            return specName;
        }
        // No matches found.
        return defaultName;
    }
    Private.getDefaultKernel = getDefaultKernel;
    /**
     * Populate a kernel select node for the session.
     */
    function populateKernelSelect(node, options) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
        let { preference, sessions, specs } = options;
        let { name, id, language, canStart, shouldStart } = preference;
        if (!specs || canStart === false) {
            node.appendChild(optionForNone());
            node.value = 'null';
            node.disabled = true;
            return;
        }
        node.disabled = false;
        // Create mappings of display names and languages for kernel name.
        let displayNames = Object.create(null);
        let languages = Object.create(null);
        for (let name in specs.kernelspecs) {
            let spec = specs.kernelspecs[name];
            displayNames[name] = spec.display_name;
            languages[name] = spec.language;
        }
        // Handle a kernel by name.
        let names = [];
        if (name && name in specs.kernelspecs) {
            names.push(name);
        }
        // Then look by language.
        if (language) {
            for (let specName in specs.kernelspecs) {
                if (name !== specName && languages[specName] === language) {
                    names.push(specName);
                }
            }
        }
        // Use the default kernel if no kernels were found.
        if (!names.length) {
            names.push(specs.default);
        }
        // Handle a preferred kernels in order of display name.
        let preferred = document.createElement('optgroup');
        preferred.label = 'Start Preferred Kernel';
        names.sort((a, b) => displayNames[a].localeCompare(displayNames[b]));
        for (let name of names) {
            preferred.appendChild(optionForName(name, displayNames[name]));
        }
        if (preferred.firstChild) {
            node.appendChild(preferred);
        }
        // Add an option for no kernel
        node.appendChild(optionForNone());
        let other = document.createElement('optgroup');
        other.label = 'Start Other Kernel';
        // Add the rest of the kernel names in alphabetical order.
        let otherNames = [];
        for (let specName in specs.kernelspecs) {
            if (names.indexOf(specName) !== -1) {
                continue;
            }
            otherNames.push(specName);
        }
        otherNames.sort((a, b) => displayNames[a].localeCompare(displayNames[b]));
        for (let otherName of otherNames) {
            other.appendChild(optionForName(otherName, displayNames[otherName]));
        }
        // Add a separator option if there were any other names.
        if (otherNames.length) {
            node.appendChild(other);
        }
        // Handle the default value.
        if (shouldStart === false) {
            node.value = 'null';
        }
        else {
            node.selectedIndex = 0;
        }
        // Bail if there are no sessions.
        if (!sessions) {
            return;
        }
        // Add the sessions using the preferred language first.
        let matchingSessions = [];
        let otherSessions = [];
        algorithm_1.each(sessions, session => {
            if (language &&
                languages[session.kernel.name] === language &&
                session.kernel.id !== id) {
                matchingSessions.push(session);
            }
            else if (session.kernel.id !== id) {
                otherSessions.push(session);
            }
        });
        let matching = document.createElement('optgroup');
        matching.label = 'Use Kernel from Preferred Session';
        node.appendChild(matching);
        if (matchingSessions.length) {
            matchingSessions.sort((a, b) => {
                return a.path.localeCompare(b.path);
            });
            algorithm_1.each(matchingSessions, session => {
                let name = displayNames[session.kernel.name];
                matching.appendChild(optionForSession(session, name));
            });
        }
        let otherSessionsNode = document.createElement('optgroup');
        otherSessionsNode.label = 'Use Kernel from Other Session';
        node.appendChild(otherSessionsNode);
        if (otherSessions.length) {
            otherSessions.sort((a, b) => {
                return a.path.localeCompare(b.path);
            });
            algorithm_1.each(otherSessions, session => {
                let name = displayNames[session.kernel.name] || session.kernel.name;
                otherSessionsNode.appendChild(optionForSession(session, name));
            });
        }
    }
    Private.populateKernelSelect = populateKernelSelect;
    /**
     * Get the kernel search options given a client session and sesion manager.
     */
    function getKernelSearch(session) {
        return {
            specs: session.manager.specs,
            sessions: session.manager.running(),
            preference: session.kernelPreference
        };
    }
    /**
     * Create an option element for a kernel name.
     */
    function optionForName(name, displayName) {
        let option = document.createElement('option');
        option.text = displayName;
        option.value = JSON.stringify({ name });
        return option;
    }
    /**
     * Create an option for no kernel.
     */
    function optionForNone() {
        let group = document.createElement('optgroup');
        group.label = 'Use No Kernel';
        let option = document.createElement('option');
        option.text = 'No Kernel';
        option.value = 'null';
        group.appendChild(option);
        return group;
    }
    /**
     * Create an option element for a session.
     */
    function optionForSession(session, displayName) {
        let option = document.createElement('option');
        let sessionName = session.name || coreutils_1.PathExt.basename(session.path);
        option.text = sessionName;
        option.value = JSON.stringify({ id: session.kernel.id });
        option.title =
            `Path: ${session.path}\n` +
                `Name: ${sessionName}\n` +
                `Kernel Name: ${displayName}\n` +
                `Kernel Id: ${session.kernel.id}`;
        return option;
    }
})(Private || (Private = {}));
