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
const __1 = require("..");
const comm_1 = require("./comm");
const messages_1 = require("./messages");
const future_1 = require("./future");
const serialize = __importStar(require("./serialize"));
const validate = __importStar(require("./validate"));
/**
 * The url for the kernel service.
 */
const KERNEL_SERVICE_URL = 'api/kernels';
/**
 * The url for the kernelspec service.
 */
const KERNELSPEC_SERVICE_URL = 'api/kernelspecs';
/**
 * Implementation of the Kernel object.
 *
 * #### Notes
 * Messages from the server are handled in the order they were received and
 * asynchronously. Any message handler can return a promise, and message
 * handling will pause until the promise is fulfilled.
 */
class DefaultKernel {
    /**
     * Construct a kernel object.
     */
    constructor(options, id) {
        /**
         * Create the kernel websocket connection and add socket status handlers.
         */
        this._createSocket = () => {
            if (this.isDisposed) {
                return;
            }
            let settings = this.serverSettings;
            let partialUrl = coreutils_1.URLExt.join(settings.wsUrl, KERNEL_SERVICE_URL, encodeURIComponent(this._id));
            // Strip any authentication from the display string.
            // TODO - Audit tests for extra websockets started
            let display = partialUrl.replace(/^((?:\w+:)?\/\/)(?:[^@\/]+@)/, '$1');
            console.log('Starting WebSocket:', display);
            let url = coreutils_1.URLExt.join(partialUrl, 'channels?session_id=' + encodeURIComponent(this._clientId));
            // If token authentication is in use.
            let token = settings.token;
            if (token !== '') {
                url = url + `&token=${encodeURIComponent(token)}`;
            }
            this._connectionPromise = new coreutils_3.PromiseDelegate();
            this._wsStopped = false;
            this._ws = new settings.WebSocket(url);
            // Ensure incoming binary messages are not Blobs
            this._ws.binaryType = 'arraybuffer';
            this._ws.onmessage = this._onWSMessage;
            this._ws.onopen = this._onWSOpen;
            this._ws.onclose = this._onWSClose;
            this._ws.onerror = this._onWSClose;
        };
        /**
         * Handle a websocket open event.
         */
        this._onWSOpen = (evt) => {
            this._reconnectAttempt = 0;
            // Allow the message to get through.
            this._isReady = true;
            // Update our status to connected.
            this._updateStatus('connected');
            // Get the kernel info, signaling that the kernel is ready.
            // TODO: requestKernelInfo shouldn't make a request, but should return cached info?
            this.requestKernelInfo()
                .then(() => {
                this._connectionPromise.resolve(void 0);
            })
                .catch(err => {
                this._connectionPromise.reject(err);
            });
            this._isReady = false;
        };
        /**
         * Handle a websocket message, validating and routing appropriately.
         */
        this._onWSMessage = (evt) => {
            if (this._wsStopped) {
                // If the socket is being closed, ignore any messages
                return;
            }
            // Notify immediately if there is an error with the message.
            let msg;
            try {
                msg = serialize.deserialize(evt.data);
                validate.validateMessage(msg);
            }
            catch (error) {
                error.message = `Kernel message validation error: ${error.message}`;
                // We throw the error so that it bubbles up to the top, and displays the right stack.
                throw error;
            }
            // Update the current kernel session id
            this._kernelSession = msg.header.session;
            // Handle the message asynchronously, in the order received.
            this._msgChain = this._msgChain
                .then(() => {
                // Return so that any promises from handling a message are fulfilled
                // before proceeding to the next message.
                return this._handleMessage(msg);
            })
                .catch(error => {
                // Log any errors in handling the message, thus resetting the _msgChain
                // promise so we can process more messages.
                console.error(error);
            });
            // Emit the message receive signal
            this._anyMessage.emit({ msg, direction: 'recv' });
        };
        /**
         * Handle a websocket close event.
         */
        this._onWSClose = (evt) => {
            if (this._wsStopped || !this._ws) {
                return;
            }
            // Clear the websocket event handlers and the socket itself.
            this._clearSocket();
            if (this._reconnectAttempt < this._reconnectLimit) {
                this._updateStatus('reconnecting');
                let timeout = Math.pow(2, this._reconnectAttempt);
                console.error('Connection lost, reconnecting in ' + timeout + ' seconds.');
                setTimeout(this._createSocket, 1e3 * timeout);
                this._reconnectAttempt += 1;
            }
            else {
                this._updateStatus('dead');
                this._connectionPromise.reject(new Error('Could not establish connection'));
            }
        };
        this._id = '';
        this._name = '';
        this._status = 'unknown';
        this._kernelSession = '';
        this._clientId = '';
        this._isDisposed = false;
        this._wsStopped = false;
        this._ws = null;
        this._username = '';
        this._reconnectLimit = 7;
        this._reconnectAttempt = 0;
        this._isReady = false;
        this._targetRegistry = Object.create(null);
        this._info = null;
        this._pendingMessages = [];
        this._statusChanged = new signaling_1.Signal(this);
        this._iopubMessage = new signaling_1.Signal(this);
        this._anyMessage = new signaling_1.Signal(this);
        this._unhandledMessage = new signaling_1.Signal(this);
        this._displayIdToParentIds = new Map();
        this._msgIdToDisplayIds = new Map();
        this._terminated = new signaling_1.Signal(this);
        this._msgChain = Promise.resolve();
        this._noOp = () => {
            /* no-op */
        };
        this._name = options.name;
        this._id = id;
        this.serverSettings =
            options.serverSettings || __1.ServerConnection.makeSettings();
        this._clientId = options.clientId || coreutils_2.UUID.uuid4();
        this._username = options.username || '';
        this._futures = new Map();
        this._comms = new Map();
        this._createSocket();
        Private.runningKernels.push(this);
    }
    /**
     * A signal emitted when the kernel is shut down.
     */
    get terminated() {
        return this._terminated;
    }
    /**
     * A signal emitted when the kernel status changes.
     */
    get statusChanged() {
        return this._statusChanged;
    }
    /**
     * A signal emitted for iopub kernel messages.
     *
     * #### Notes
     * This signal is emitted after the iopub message is handled asynchronously.
     */
    get iopubMessage() {
        return this._iopubMessage;
    }
    /**
     * A signal emitted for unhandled kernel message.
     *
     * #### Notes
     * This signal is emitted for a message that was not handled. It is emitted
     * during the asynchronous message handling code.
     */
    get unhandledMessage() {
        return this._unhandledMessage;
    }
    /**
     * A signal emitted for any kernel message.
     *
     * #### Notes
     * This signal is emitted when a message is received, before it is handled
     * asynchronously.
     *
     * The behavior is undefined if the message is modified during message
     * handling. As such, the message should be treated as read-only.
     */
    get anyMessage() {
        return this._anyMessage;
    }
    /**
     * The id of the server-side kernel.
     */
    get id() {
        return this._id;
    }
    /**
     * The name of the server-side kernel.
     */
    get name() {
        return this._name;
    }
    /**
     * Get the model associated with the kernel.
     */
    get model() {
        return { name: this.name, id: this.id };
    }
    /**
     * The client username.
     */
    get username() {
        return this._username;
    }
    /**
     * The client unique id.
     */
    get clientId() {
        return this._clientId;
    }
    /**
     * The current status of the kernel.
     */
    get status() {
        return this._status;
    }
    /**
     * Test whether the kernel has been disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * The cached kernel info.
     *
     * #### Notes
     * This value will be null until the kernel is ready.
     */
    get info() {
        return this._info;
    }
    /**
     * Test whether the kernel is ready.
     */
    get isReady() {
        return this._isReady;
    }
    /**
     * A promise that is fulfilled when the kernel is ready.
     */
    get ready() {
        return this._connectionPromise.promise;
    }
    /**
     * Get the kernel spec.
     *
     * @returns A promise that resolves with the kernel spec.
     */
    getSpec() {
        if (this._specPromise) {
            return this._specPromise;
        }
        this._specPromise = Private.findSpecs(this.serverSettings).then(specs => {
            return specs.kernelspecs[this._name];
        });
        return this._specPromise;
    }
    /**
     * Clone the current kernel with a new clientId.
     */
    clone() {
        return new DefaultKernel({
            name: this._name,
            username: this._username,
            serverSettings: this.serverSettings
        }, this._id);
    }
    /**
     * Dispose of the resources held by the kernel.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._terminated.emit(void 0);
        this._status = 'dead';
        this._clearState();
        this._clearSocket();
        this._kernelSession = '';
        this._msgChain = null;
        algorithm_1.ArrayExt.removeFirstOf(Private.runningKernels, this);
        signaling_1.Signal.clearData(this);
    }
    /**
     * Send a shell message to the kernel.
     *
     * #### Notes
     * Send a message to the kernel's shell channel, yielding a future object
     * for accepting replies.
     *
     * If `expectReply` is given and `true`, the future is disposed when both a
     * shell reply and an idle status message are received. If `expectReply`
     * is not given or is `false`, the future is resolved when an idle status
     * message is received.
     * If `disposeOnDone` is not given or is `true`, the Future is disposed at this point.
     * If `disposeOnDone` is given and `false`, it is up to the caller to dispose of the Future.
     *
     * All replies are validated as valid kernel messages.
     *
     * If the kernel status is `dead`, this will throw an error.
     */
    sendShellMessage(msg, expectReply = false, disposeOnDone = true) {
        if (this.status === 'dead') {
            throw new Error('Kernel is dead');
        }
        if (!this._isReady || !this._ws) {
            this._pendingMessages.push(msg);
        }
        else {
            this._ws.send(serialize.serialize(msg));
        }
        this._anyMessage.emit({ msg, direction: 'send' });
        let future = new future_1.KernelFutureHandler(() => {
            let msgId = msg.header.msg_id;
            this._futures.delete(msgId);
            // Remove stored display id information.
            let displayIds = this._msgIdToDisplayIds.get(msgId);
            if (!displayIds) {
                return;
            }
            displayIds.forEach(displayId => {
                let msgIds = this._displayIdToParentIds.get(displayId);
                if (msgIds) {
                    let idx = msgIds.indexOf(msgId);
                    if (idx === -1) {
                        return;
                    }
                    if (msgIds.length === 1) {
                        this._displayIdToParentIds.delete(displayId);
                    }
                    else {
                        msgIds.splice(idx, 1);
                        this._displayIdToParentIds.set(displayId, msgIds);
                    }
                }
            });
            this._msgIdToDisplayIds.delete(msgId);
        }, msg, expectReply, disposeOnDone, this);
        this._futures.set(msg.header.msg_id, future);
        return future;
    }
    /**
     * Interrupt a kernel.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels).
     *
     * The promise is fulfilled on a valid response and rejected otherwise.
     *
     * It is assumed that the API call does not mutate the kernel id or name.
     *
     * The promise will be rejected if the kernel status is `Dead` or if the
     * request fails or the response is invalid.
     */
    interrupt() {
        return Private.interruptKernel(this, this.serverSettings);
    }
    /**
     * Restart a kernel.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
     *
     * Any existing Future or Comm objects are cleared.
     *
     * The promise is fulfilled on a valid response and rejected otherwise.
     *
     * It is assumed that the API call does not mutate the kernel id or name.
     *
     * The promise will be rejected if the request fails or the response is
     * invalid.
     */
    restart() {
        return Private.restartKernel(this, this.serverSettings);
    }
    /**
     * Handle a restart on the kernel.  This is not part of the `IKernel`
     * interface.
     */
    handleRestart() {
        this._clearState();
        this._updateStatus('restarting');
        this._clearSocket();
    }
    /**
     * Reconnect to a disconnected kernel.
     *
     * #### Notes
     * Used when the websocket connection to the kernel is lost.
     */
    reconnect() {
        this._clearSocket();
        this._updateStatus('reconnecting');
        this._createSocket();
        return this._connectionPromise.promise;
    }
    /**
     * Shutdown a kernel.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels).
     *
     * The promise is fulfilled on a valid response and rejected otherwise.
     *
     * On a valid response, closes the websocket and disposes of the kernel
     * object, and fulfills the promise.
     *
     * The promise will be rejected if the kernel status is `Dead` or if the
     * request fails or the response is invalid.
     */
    shutdown() {
        if (this.status === 'dead') {
            this._clearSocket();
            this._clearState();
            return;
        }
        return Private.shutdownKernel(this.id, this.serverSettings).then(() => {
            this._clearState();
            this._clearSocket();
        });
    }
    /**
     * Send a `kernel_info_request` message.
     *
     * #### Notes
     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#kernel-info).
     *
     * Fulfills with the `kernel_info_response` content when the shell reply is
     * received and validated.
     *
     * TODO: this should be automatically run every time our kernel restarts,
     * before we say the kernel is ready, and cache the info and the kernel
     * session id. Further calls to this should returned the cached results.
     */
    requestKernelInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                msgType: 'kernel_info_request',
                channel: 'shell',
                username: this._username,
                session: this._clientId
            };
            let msg = messages_1.KernelMessage.createShellMessage(options);
            let reply = (yield Private.handleShellMessage(this, msg));
            if (this.isDisposed) {
                throw new Error('Disposed kernel');
            }
            this._info = reply.content;
            return reply;
        });
    }
    /**
     * Send a `complete_request` message.
     *
     * #### Notes
     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#completion).
     *
     * Fulfills with the `complete_reply` content when the shell reply is
     * received and validated.
     */
    requestComplete(content) {
        let options = {
            msgType: 'complete_request',
            channel: 'shell',
            username: this._username,
            session: this._clientId
        };
        let msg = messages_1.KernelMessage.createShellMessage(options, content);
        return Private.handleShellMessage(this, msg);
    }
    /**
     * Send an `inspect_request` message.
     *
     * #### Notes
     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#introspection).
     *
     * Fulfills with the `inspect_reply` content when the shell reply is
     * received and validated.
     */
    requestInspect(content) {
        let options = {
            msgType: 'inspect_request',
            channel: 'shell',
            username: this._username,
            session: this._clientId
        };
        let msg = messages_1.KernelMessage.createShellMessage(options, content);
        return Private.handleShellMessage(this, msg);
    }
    /**
     * Send a `history_request` message.
     *
     * #### Notes
     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#history).
     *
     * Fulfills with the `history_reply` content when the shell reply is
     * received and validated.
     */
    requestHistory(content) {
        let options = {
            msgType: 'history_request',
            channel: 'shell',
            username: this._username,
            session: this._clientId
        };
        let msg = messages_1.KernelMessage.createShellMessage(options, content);
        return Private.handleShellMessage(this, msg);
    }
    /**
     * Send an `execute_request` message.
     *
     * #### Notes
     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#execute).
     *
     * Future `onReply` is called with the `execute_reply` content when the
     * shell reply is received and validated. The future will resolve when
     * this message is received and the `idle` iopub status is received.
     * The future will also be disposed at this point unless `disposeOnDone`
     * is specified and `false`, in which case it is up to the caller to dispose
     * of the future.
     *
     * **See also:** [[IExecuteReply]]
     */
    requestExecute(content, disposeOnDone = true, metadata) {
        let options = {
            msgType: 'execute_request',
            channel: 'shell',
            username: this._username,
            session: this._clientId
        };
        let defaults = {
            silent: false,
            store_history: true,
            user_expressions: {},
            allow_stdin: true,
            stop_on_error: false
        };
        content = Object.assign({}, defaults, content);
        let msg = messages_1.KernelMessage.createShellMessage(options, content, metadata);
        return this.sendShellMessage(msg, true, disposeOnDone);
    }
    /**
     * Send an `is_complete_request` message.
     *
     * #### Notes
     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#code-completeness).
     *
     * Fulfills with the `is_complete_response` content when the shell reply is
     * received and validated.
     */
    requestIsComplete(content) {
        let options = {
            msgType: 'is_complete_request',
            channel: 'shell',
            username: this._username,
            session: this._clientId
        };
        let msg = messages_1.KernelMessage.createShellMessage(options, content);
        return Private.handleShellMessage(this, msg);
    }
    /**
     * Send a `comm_info_request` message.
     *
     * #### Notes
     * Fulfills with the `comm_info_reply` content when the shell reply is
     * received and validated.
     */
    requestCommInfo(content) {
        let options = {
            msgType: 'comm_info_request',
            channel: 'shell',
            username: this._username,
            session: this._clientId
        };
        let msg = messages_1.KernelMessage.createShellMessage(options, content);
        return Private.handleShellMessage(this, msg);
    }
    /**
     * Send an `input_reply` message.
     *
     * #### Notes
     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#messages-on-the-stdin-router-dealer-sockets).
     */
    sendInputReply(content) {
        if (this.status === 'dead') {
            throw new Error('Kernel is dead');
        }
        let options = {
            msgType: 'input_reply',
            channel: 'stdin',
            username: this._username,
            session: this._clientId
        };
        let msg = messages_1.KernelMessage.createMessage(options, content);
        if (!this._isReady || !this._ws) {
            this._pendingMessages.push(msg);
        }
        else {
            this._ws.send(serialize.serialize(msg));
        }
        this._anyMessage.emit({ msg, direction: 'send' });
    }
    /**
     * Connect to a comm, or create a new one.
     *
     * #### Notes
     * If a client-side comm already exists with the given commId, it is returned.
     */
    connectToComm(targetName, commId = coreutils_2.UUID.uuid4()) {
        if (this._comms.has(commId)) {
            return this._comms.get(commId);
        }
        let comm = new comm_1.CommHandler(targetName, commId, this, () => {
            this._unregisterComm(commId);
        });
        this._comms.set(commId, comm);
        return comm;
    }
    /**
     * Register a comm target handler.
     *
     * @param targetName - The name of the comm target.
     *
     * @param callback - The callback invoked for a comm open message.
     *
     * @returns A disposable used to unregister the comm target.
     *
     * #### Notes
     * Only one comm target can be registered to a target name at a time, an
     * existing callback for the same target name will be overridden.  A registered
     * comm target handler will take precedence over a comm which specifies a
     * `target_module`.
     *
     * If the callback returns a promise, kernel message processing will pause
     * until the returned promise is fulfilled.
     */
    registerCommTarget(targetName, callback) {
        this._targetRegistry[targetName] = callback;
    }
    /**
     * Remove a comm target handler.
     *
     * @param targetName - The name of the comm target to remove.
     *
     * @param callback - The callback to remove.
     *
     * #### Notes
     * The comm target is only removed the callback argument matches.
     */
    removeCommTarget(targetName, callback) {
        if (!this.isDisposed && this._targetRegistry[targetName] === callback) {
            delete this._targetRegistry[targetName];
        }
    }
    /**
     * Register an IOPub message hook.
     *
     * @param msg_id - The parent_header message id the hook will intercept.
     *
     * @param hook - The callback invoked for the message.
     *
     * #### Notes
     * The IOPub hook system allows you to preempt the handlers for IOPub
     * messages that are responses to a given message id.
     *
     * The most recently registered hook is run first. A hook can return a
     * boolean or a promise to a boolean, in which case all kernel message
     * processing pauses until the promise is fulfilled. If a hook return value
     * resolves to false, any later hooks will not run and the function will
     * return a promise resolving to false. If a hook throws an error, the error
     * is logged to the console and the next hook is run. If a hook is
     * registered during the hook processing, it will not run until the next
     * message. If a hook is removed during the hook processing, it will be
     * deactivated immediately.
     *
     * See also [[IFuture.registerMessageHook]].
     */
    registerMessageHook(msgId, hook) {
        let future = this._futures && this._futures.get(msgId);
        if (future) {
            future.registerMessageHook(hook);
        }
    }
    /**
     * Remove an IOPub message hook.
     *
     * @param msg_id - The parent_header message id the hook intercepted.
     *
     * @param hook - The callback invoked for the message.
     *
     */
    removeMessageHook(msgId, hook) {
        let future = this._futures && this._futures.get(msgId);
        if (future) {
            future.removeMessageHook(hook);
        }
    }
    /**
     * Handle a message with a display id.
     *
     * @returns Whether the message was handled.
     */
    _handleDisplayId(displayId, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let msgId = msg.parent_header.msg_id;
            let parentIds = this._displayIdToParentIds.get(displayId);
            if (parentIds) {
                // We've seen it before, update existing outputs with same display_id
                // by handling display_data as update_display_data.
                let updateMsg = {
                    header: coreutils_3.JSONExt.deepCopy(msg.header),
                    parent_header: coreutils_3.JSONExt.deepCopy(msg.parent_header),
                    metadata: coreutils_3.JSONExt.deepCopy(msg.metadata),
                    content: coreutils_3.JSONExt.deepCopy(msg.content),
                    channel: msg.channel,
                    buffers: msg.buffers ? msg.buffers.slice() : []
                };
                updateMsg.header.msg_type = 'update_display_data';
                yield Promise.all(parentIds.map((parentId) => __awaiter(this, void 0, void 0, function* () {
                    let future = this._futures && this._futures.get(parentId);
                    if (future) {
                        yield future.handleMsg(updateMsg);
                    }
                })));
            }
            // We're done here if it's update_display.
            if (msg.header.msg_type === 'update_display_data') {
                // It's an update, don't proceed to the normal display.
                return true;
            }
            // Regular display_data with id, record it for future updating
            // in _displayIdToParentIds for future lookup.
            parentIds = this._displayIdToParentIds.get(displayId) || [];
            if (parentIds.indexOf(msgId) === -1) {
                parentIds.push(msgId);
            }
            this._displayIdToParentIds.set(displayId, parentIds);
            // Add to our map of display ids for this message.
            let displayIds = this._msgIdToDisplayIds.get(msgId) || [];
            if (displayIds.indexOf(msgId) === -1) {
                displayIds.push(msgId);
            }
            this._msgIdToDisplayIds.set(msgId, displayIds);
            // Let the message propagate to the intended recipient.
            return false;
        });
    }
    /**
     * Clear the socket state.
     */
    _clearSocket() {
        this._wsStopped = true;
        this._isReady = false;
        if (this._ws !== null) {
            // Clear the websocket event handlers and the socket itself.
            this._ws.onopen = this._noOp;
            this._ws.onclose = this._noOp;
            this._ws.onerror = this._noOp;
            this._ws.onmessage = this._noOp;
            this._ws.close();
            this._ws = null;
        }
    }
    /**
     * Handle status iopub messages from the kernel.
     */
    _updateStatus(status) {
        switch (status) {
            case 'starting':
            case 'idle':
            case 'busy':
            case 'connected':
                this._isReady = true;
                break;
            case 'restarting':
            case 'reconnecting':
            case 'dead':
                this._isReady = false;
                break;
            default:
                console.error('invalid kernel status:', status);
                return;
        }
        if (status !== this._status) {
            this._status = status;
            Private.logKernelStatus(this);
            this._statusChanged.emit(status);
            if (status === 'dead') {
                this.dispose();
            }
        }
        if (this._isReady) {
            this._sendPending();
        }
    }
    /**
     * Send pending messages to the kernel.
     */
    _sendPending() {
        // We shift the message off the queue
        // after the message is sent so that if there is an exception,
        // the message is still pending.
        while (this._ws && this._pendingMessages.length > 0) {
            let msg = serialize.serialize(this._pendingMessages[0]);
            this._ws.send(msg);
            this._pendingMessages.shift();
        }
    }
    /**
     * Clear the internal state.
     */
    _clearState() {
        this._isReady = false;
        this._pendingMessages = [];
        this._futures.forEach(future => {
            future.dispose();
        });
        this._comms.forEach(comm => {
            comm.dispose();
        });
        this._msgChain = Promise.resolve();
        this._kernelSession = '';
        this._futures = new Map();
        this._comms = new Map();
        this._displayIdToParentIds.clear();
        this._msgIdToDisplayIds.clear();
    }
    /**
     * Check to make sure it is okay to proceed to handle a message.
     *
     * #### Notes
     * Because we handle messages asynchronously, before a message is handled the
     * kernel might be disposed or restarted (and have a different session id).
     * This function throws an error in each of these cases. This is meant to be
     * called at the start of an asynchronous message handler to cancel message
     * processing if the message no longer is valid.
     */
    _assertCurrentMessage(msg) {
        if (this.isDisposed) {
            throw new Error('Kernel object is disposed');
        }
        if (msg.header.session !== this._kernelSession) {
            throw new Error(`Canceling handling of old message: ${msg.header.msg_type}`);
        }
    }
    /**
     * Handle a `comm_open` kernel message.
     */
    _handleCommOpen(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            this._assertCurrentMessage(msg);
            let content = msg.content;
            let comm = new comm_1.CommHandler(content.target_name, content.comm_id, this, () => {
                this._unregisterComm(content.comm_id);
            });
            this._comms.set(content.comm_id, comm);
            try {
                let target = yield Private.loadObject(content.target_name, content.target_module, this._targetRegistry);
                yield target(comm, msg);
            }
            catch (e) {
                // Close the comm asynchronously. We cannot block message processing on
                // kernel messages to wait for another kernel message.
                comm.close();
                console.error('Exception opening new comm');
                throw e;
            }
        });
    }
    /**
     * Handle 'comm_close' kernel message.
     */
    _handleCommClose(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            this._assertCurrentMessage(msg);
            let content = msg.content;
            let comm = this._comms.get(content.comm_id);
            if (!comm) {
                console.error('Comm not found for comm id ' + content.comm_id);
                return;
            }
            this._unregisterComm(comm.commId);
            let onClose = comm.onClose;
            if (onClose) {
                yield onClose(msg);
            }
            comm.dispose();
        });
    }
    /**
     * Handle a 'comm_msg' kernel message.
     */
    _handleCommMsg(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            this._assertCurrentMessage(msg);
            let content = msg.content;
            let comm = this._comms.get(content.comm_id);
            if (!comm) {
                return;
            }
            let onMsg = comm.onMsg;
            if (onMsg) {
                yield onMsg(msg);
            }
        });
    }
    /**
     * Unregister a comm instance.
     */
    _unregisterComm(commId) {
        this._comms.delete(commId);
    }
    _handleMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let handled = false;
            // Check to see if we have a display_id we need to reroute.
            if (msg.parent_header && msg.channel === 'iopub') {
                switch (msg.header.msg_type) {
                    case 'display_data':
                    case 'update_display_data':
                    case 'execute_result':
                        // display_data messages may re-route based on their display_id.
                        let transient = (msg.content.transient || {});
                        let displayId = transient['display_id'];
                        if (displayId) {
                            handled = yield this._handleDisplayId(displayId, msg);
                            // The await above may make this message out of date, so check again.
                            this._assertCurrentMessage(msg);
                        }
                        break;
                    default:
                        break;
                }
            }
            if (!handled && msg.parent_header) {
                let parentHeader = msg.parent_header;
                let future = this._futures && this._futures.get(parentHeader.msg_id);
                if (future) {
                    yield future.handleMsg(msg);
                    this._assertCurrentMessage(msg);
                }
                else {
                    // If the message was sent by us and was not iopub, it is orphaned.
                    let owned = parentHeader.session === this.clientId;
                    if (msg.channel !== 'iopub' && owned) {
                        this._unhandledMessage.emit(msg);
                    }
                }
            }
            if (msg.channel === 'iopub') {
                switch (msg.header.msg_type) {
                    case 'status':
                        // Updating the status is synchronous, and we call no async user code
                        this._updateStatus(msg.content.execution_state);
                        break;
                    case 'comm_open':
                        yield this._handleCommOpen(msg);
                        break;
                    case 'comm_msg':
                        yield this._handleCommMsg(msg);
                        break;
                    case 'comm_close':
                        yield this._handleCommClose(msg);
                        break;
                    default:
                        break;
                }
                // If the message was a status dead message, we might have disposed ourselves.
                if (!this.isDisposed) {
                    this._assertCurrentMessage(msg);
                    // the message wouldn't be emitted if we were disposed anyway.
                    this._iopubMessage.emit(msg);
                }
            }
        });
    }
}
exports.DefaultKernel = DefaultKernel;
/**
 * The namespace for `DefaultKernel` statics.
 */
(function (DefaultKernel) {
    /**
     * Find a kernel by id.
     *
     * @param id - The id of the kernel of interest.
     *
     * @param settings - The optional server settings.
     *
     * @returns A promise that resolves with the model for the kernel.
     *
     * #### Notes
     * If the kernel was already started via `startNewKernel`, we return its
     * `Kernel.IModel`.
     *
     * Otherwise, we attempt to find an existing kernel by connecting to the
     * server. The promise is fulfilled when the kernel is found, otherwise the
     * promise is rejected.
     */
    function findById(id, settings) {
        return Private.findById(id, settings);
    }
    DefaultKernel.findById = findById;
    /**
     * Fetch all of the kernel specs.
     *
     * @param settings - The optional server settings.
     *
     * @returns A promise that resolves with the kernel specs.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernelspecs).
     */
    function getSpecs(settings) {
        return Private.getSpecs(settings);
    }
    DefaultKernel.getSpecs = getSpecs;
    /**
     * Fetch the running kernels.
     *
     * @param settings - The optional server settings.
     *
     * @returns A promise that resolves with the list of running kernels.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
     *
     * The promise is fulfilled on a valid response and rejected otherwise.
     */
    function listRunning(settings) {
        return Private.listRunning(settings);
    }
    DefaultKernel.listRunning = listRunning;
    /**
     * Start a new kernel.
     *
     * @param options - The options used to create the kernel.
     *
     * @returns A promise that resolves with a kernel object.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
     *
     * If no options are given or the kernel name is not given, the
     * default kernel will by started by the server.
     *
     * Wraps the result in a Kernel object. The promise is fulfilled
     * when the kernel is started by the server, otherwise the promise is rejected.
     */
    function startNew(options) {
        return Private.startNew(options);
    }
    DefaultKernel.startNew = startNew;
    /**
     * Connect to a running kernel.
     *
     * @param model - The model of the running kernel.
     *
     * @param settings - The server settings for the request.
     *
     * @returns The kernel object.
     *
     * #### Notes
     * If the kernel was already started via `startNewKernel`, the existing
     * Kernel object info is used to create another instance.
     */
    function connectTo(model, settings) {
        return Private.connectTo(model, settings);
    }
    DefaultKernel.connectTo = connectTo;
    /**
     * Shut down a kernel by id.
     *
     * @param id - The id of the running kernel.
     *
     * @param settings - The server settings for the request.
     *
     * @returns A promise that resolves when the kernel is shut down.
     */
    function shutdown(id, settings) {
        return Private.shutdownKernel(id, settings);
    }
    DefaultKernel.shutdown = shutdown;
    /**
     * Shut down all kernels.
     *
     * @param settings - The server settings to use.
     *
     * @returns A promise that resolves when all the kernels are shut down.
     */
    function shutdownAll(settings) {
        return Private.shutdownAll(settings);
    }
    DefaultKernel.shutdownAll = shutdownAll;
})(DefaultKernel = exports.DefaultKernel || (exports.DefaultKernel = {}));
/**
 * A private namespace for the Kernel.
 */
var Private;
(function (Private) {
    /**
     * A module private store for running kernels.
     */
    Private.runningKernels = [];
    /**
     * A module private store of kernel specs by base url.
     */
    Private.specs = Object.create(null);
    /**
     * Find a kernel by id.
     *
     * Will reach out to the server if needed to find the kernel.
     */
    function findById(id, settings) {
        let kernel = algorithm_1.find(Private.runningKernels, value => {
            return value.id === id;
        });
        if (kernel) {
            return Promise.resolve(kernel.model);
        }
        return getKernelModel(id, settings).catch(() => {
            throw new Error(`No running kernel with id: ${id}`);
        });
    }
    Private.findById = findById;
    /**
     * Get the cached kernel specs or fetch them.
     */
    function findSpecs(settings) {
        settings = settings || __1.ServerConnection.makeSettings();
        let promise = Private.specs[settings.baseUrl];
        if (promise) {
            return promise;
        }
        return getSpecs(settings);
    }
    Private.findSpecs = findSpecs;
    /**
     * Fetch all of the kernel specs.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernelspecs).
     */
    function getSpecs(settings) {
        settings = settings || __1.ServerConnection.makeSettings();
        let url = coreutils_1.URLExt.join(settings.baseUrl, KERNELSPEC_SERVICE_URL);
        let promise = __1.ServerConnection.makeRequest(url, {}, settings)
            .then(response => {
            if (response.status !== 200) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            return response.json();
        })
            .then(data => {
            return validate.validateSpecModels(data);
        });
        Private.specs[settings.baseUrl] = promise;
        return promise;
    }
    Private.getSpecs = getSpecs;
    /**
     * Fetch the running kernels.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/kernels) and validates the response model.
     *
     * The promise is fulfilled on a valid response and rejected otherwise.
     */
    function listRunning(settings) {
        settings = settings || __1.ServerConnection.makeSettings();
        let url = coreutils_1.URLExt.join(settings.baseUrl, KERNEL_SERVICE_URL);
        return __1.ServerConnection.makeRequest(url, {}, settings)
            .then(response => {
            if (response.status !== 200) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            return response.json();
        })
            .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Invalid kernel list');
            }
            for (let i = 0; i < data.length; i++) {
                validate.validateModel(data[i]);
            }
            return updateRunningKernels(data);
        });
    }
    Private.listRunning = listRunning;
    /**
     * Update the running kernels based on new data from the server.
     */
    function updateRunningKernels(kernels) {
        algorithm_1.each(Private.runningKernels.slice(), kernel => {
            let updated = algorithm_1.find(kernels, model => {
                return kernel.id === model.id;
            });
            // If kernel is no longer running on disk, emit dead signal.
            if (!updated && kernel.status !== 'dead') {
                kernel.dispose();
            }
        });
        return kernels;
    }
    Private.updateRunningKernels = updateRunningKernels;
    /**
     * Start a new kernel.
     */
    function startNew(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let settings = options.serverSettings || __1.ServerConnection.makeSettings();
            let url = coreutils_1.URLExt.join(settings.baseUrl, KERNEL_SERVICE_URL);
            let init = {
                method: 'POST',
                body: JSON.stringify({ name: options.name })
            };
            let response = yield __1.ServerConnection.makeRequest(url, init, settings);
            if (response.status !== 201) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            let data = yield response.json();
            validate.validateModel(data);
            return new DefaultKernel(Object.assign({}, options, { name: data.name, serverSettings: settings }), data.id);
        });
    }
    Private.startNew = startNew;
    /**
     * Connect to a running kernel.
     */
    function connectTo(model, settings) {
        let serverSettings = settings || __1.ServerConnection.makeSettings();
        let kernel = algorithm_1.find(Private.runningKernels, value => {
            return value.id === model.id;
        });
        if (kernel) {
            return kernel.clone();
        }
        return new DefaultKernel({ name: model.name, serverSettings }, model.id);
    }
    Private.connectTo = connectTo;
    /**
     * Restart a kernel.
     */
    function restartKernel(kernel, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (kernel.status === 'dead') {
                throw new Error('Kernel is dead');
            }
            settings = settings || __1.ServerConnection.makeSettings();
            let url = coreutils_1.URLExt.join(settings.baseUrl, KERNEL_SERVICE_URL, encodeURIComponent(kernel.id), 'restart');
            let init = { method: 'POST' };
            // TODO: If we handleRestart before making the server request, we sever the
            // communication link before the shutdown_reply message comes, so we end up
            // getting the shutdown_reply messages after we reconnect, which is weird.
            // We might want to move the handleRestart to after we get the response back
            // Handle the restart on all of the kernels with the same id.
            algorithm_1.each(Private.runningKernels, k => {
                if (k.id === kernel.id) {
                    k.handleRestart();
                }
            });
            let response = yield __1.ServerConnection.makeRequest(url, init, settings);
            if (response.status !== 200) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            let data = yield response.json();
            validate.validateModel(data);
            // Reconnect the other kernels asynchronously, but don't wait for them.
            algorithm_1.each(Private.runningKernels, k => {
                if (k !== kernel && k.id === kernel.id) {
                    k.reconnect();
                }
            });
            yield kernel.reconnect();
        });
    }
    Private.restartKernel = restartKernel;
    /**
     * Interrupt a kernel.
     */
    function interruptKernel(kernel, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (kernel.status === 'dead') {
                throw new Error('Kernel is dead');
            }
            settings = settings || __1.ServerConnection.makeSettings();
            let url = coreutils_1.URLExt.join(settings.baseUrl, KERNEL_SERVICE_URL, encodeURIComponent(kernel.id), 'interrupt');
            let init = { method: 'POST' };
            let response = yield __1.ServerConnection.makeRequest(url, init, settings);
            if (response.status !== 204) {
                throw new __1.ServerConnection.ResponseError(response);
            }
        });
    }
    Private.interruptKernel = interruptKernel;
    /**
     * Delete a kernel.
     */
    function shutdownKernel(id, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            settings = settings || __1.ServerConnection.makeSettings();
            let url = coreutils_1.URLExt.join(settings.baseUrl, KERNEL_SERVICE_URL, encodeURIComponent(id));
            let init = { method: 'DELETE' };
            let response = yield __1.ServerConnection.makeRequest(url, init, settings);
            if (response.status === 404) {
                let msg = `The kernel "${id}" does not exist on the server`;
                console.warn(msg);
            }
            else if (response.status !== 204) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            killKernels(id);
        });
    }
    Private.shutdownKernel = shutdownKernel;
    /**
     * Shut down all kernels.
     *
     * @param settings - The server settings to use.
     *
     * @returns A promise that resolves when all the kernels are shut down.
     */
    function shutdownAll(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            settings = settings || __1.ServerConnection.makeSettings();
            let running = yield listRunning(settings);
            yield Promise.all(running.map(k => shutdownKernel(k.id, settings)));
        });
    }
    Private.shutdownAll = shutdownAll;
    /**
     * Kill the kernels by id.
     */
    function killKernels(id) {
        // Iterate on an array copy so disposals will not affect the iteration.
        Private.runningKernels.slice().forEach(kernel => {
            if (kernel.id === id) {
                kernel.dispose();
            }
        });
    }
    /**
     * Get a full kernel model from the server by kernel id string.
     */
    function getKernelModel(id, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            settings = settings || __1.ServerConnection.makeSettings();
            let url = coreutils_1.URLExt.join(settings.baseUrl, KERNEL_SERVICE_URL, encodeURIComponent(id));
            let response = yield __1.ServerConnection.makeRequest(url, {}, settings);
            if (response.status !== 200) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            let data = yield response.json();
            validate.validateModel(data);
            return data;
        });
    }
    Private.getKernelModel = getKernelModel;
    /**
     * Log the current kernel status.
     */
    function logKernelStatus(kernel) {
        switch (kernel.status) {
            case 'idle':
            case 'busy':
            case 'unknown':
                return;
            default:
                console.log(`Kernel: ${kernel.status} (${kernel.id})`);
                break;
        }
    }
    Private.logKernelStatus = logKernelStatus;
    /**
     * Send a kernel message to the kernel and resolve the reply message.
     */
    function handleShellMessage(kernel, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let future = kernel.sendShellMessage(msg, true);
            return future.done;
        });
    }
    Private.handleShellMessage = handleShellMessage;
    /**
     * Try to load an object from a module or a registry.
     *
     * Try to load an object from a module asynchronously if a module
     * is specified, otherwise tries to load an object from the global
     * registry, if the global registry is provided.
     */
    function loadObject(name, moduleName, registry) {
        return new Promise((resolve, reject) => {
            // Try loading the view module using require.js
            if (moduleName) {
                if (typeof requirejs === 'undefined') {
                    throw new Error('requirejs not found');
                }
                requirejs([moduleName], (mod) => {
                    if (mod[name] === void 0) {
                        let msg = `Object '${name}' not found in module '${moduleName}'`;
                        reject(new Error(msg));
                    }
                    else {
                        resolve(mod[name]);
                    }
                }, reject);
            }
            else {
                if (registry && registry[name]) {
                    resolve(registry[name]);
                }
                else {
                    reject(new Error(`Object '${name}' not found in registry`));
                }
            }
        });
    }
    Private.loadObject = loadObject;
})(Private || (Private = {}));
