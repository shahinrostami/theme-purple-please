import { JSONObject } from '@phosphor/coreutils';
import { ISignal } from '@phosphor/signaling';
import { ServerConnection } from '..';
import { Kernel } from './kernel';
import { KernelMessage } from './messages';
/**
 * Implementation of the Kernel object.
 *
 * #### Notes
 * Messages from the server are handled in the order they were received and
 * asynchronously. Any message handler can return a promise, and message
 * handling will pause until the promise is fulfilled.
 */
export declare class DefaultKernel implements Kernel.IKernel {
    /**
     * Construct a kernel object.
     */
    constructor(options: Kernel.IOptions, id: string);
    /**
     * A signal emitted when the kernel is shut down.
     */
    readonly terminated: ISignal<this, void>;
    /**
     * The server settings for the kernel.
     */
    readonly serverSettings: ServerConnection.ISettings;
    /**
     * A signal emitted when the kernel status changes.
     */
    readonly statusChanged: ISignal<this, Kernel.Status>;
    /**
     * A signal emitted for iopub kernel messages.
     *
     * #### Notes
     * This signal is emitted after the iopub message is handled asynchronously.
     */
    readonly iopubMessage: ISignal<this, KernelMessage.IIOPubMessage>;
    /**
     * A signal emitted for unhandled kernel message.
     *
     * #### Notes
     * This signal is emitted for a message that was not handled. It is emitted
     * during the asynchronous message handling code.
     */
    readonly unhandledMessage: ISignal<this, KernelMessage.IMessage>;
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
    readonly anyMessage: ISignal<this, Kernel.IAnyMessageArgs>;
    /**
     * The id of the server-side kernel.
     */
    readonly id: string;
    /**
     * The name of the server-side kernel.
     */
    readonly name: string;
    /**
     * Get the model associated with the kernel.
     */
    readonly model: Kernel.IModel;
    /**
     * The client username.
     */
    readonly username: string;
    /**
     * The client unique id.
     */
    readonly clientId: string;
    /**
     * The current status of the kernel.
     */
    readonly status: Kernel.Status;
    /**
     * Test whether the kernel has been disposed.
     */
    readonly isDisposed: boolean;
    /**
     * The cached kernel info.
     *
     * #### Notes
     * This value will be null until the kernel is ready.
     */
    readonly info: KernelMessage.IInfoReply | null;
    /**
     * Test whether the kernel is ready.
     */
    readonly isReady: boolean;
    /**
     * A promise that is fulfilled when the kernel is ready.
     */
    readonly ready: Promise<void>;
    /**
     * Get the kernel spec.
     *
     * @returns A promise that resolves with the kernel spec.
     */
    getSpec(): Promise<Kernel.ISpecModel>;
    /**
     * Clone the current kernel with a new clientId.
     */
    clone(): Kernel.IKernel;
    /**
     * Dispose of the resources held by the kernel.
     */
    dispose(): void;
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
    sendShellMessage(msg: KernelMessage.IShellMessage, expectReply?: boolean, disposeOnDone?: boolean): Kernel.IFuture;
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
    interrupt(): Promise<void>;
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
    restart(): Promise<void>;
    /**
     * Handle a restart on the kernel.  This is not part of the `IKernel`
     * interface.
     */
    handleRestart(): void;
    /**
     * Reconnect to a disconnected kernel.
     *
     * #### Notes
     * Used when the websocket connection to the kernel is lost.
     */
    reconnect(): Promise<void>;
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
    shutdown(): Promise<void>;
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
    requestKernelInfo(): Promise<KernelMessage.IInfoReplyMsg>;
    /**
     * Send a `complete_request` message.
     *
     * #### Notes
     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#completion).
     *
     * Fulfills with the `complete_reply` content when the shell reply is
     * received and validated.
     */
    requestComplete(content: KernelMessage.ICompleteRequest): Promise<KernelMessage.ICompleteReplyMsg>;
    /**
     * Send an `inspect_request` message.
     *
     * #### Notes
     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#introspection).
     *
     * Fulfills with the `inspect_reply` content when the shell reply is
     * received and validated.
     */
    requestInspect(content: KernelMessage.IInspectRequest): Promise<KernelMessage.IInspectReplyMsg>;
    /**
     * Send a `history_request` message.
     *
     * #### Notes
     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#history).
     *
     * Fulfills with the `history_reply` content when the shell reply is
     * received and validated.
     */
    requestHistory(content: KernelMessage.IHistoryRequest): Promise<KernelMessage.IHistoryReplyMsg>;
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
    requestExecute(content: KernelMessage.IExecuteRequest, disposeOnDone?: boolean, metadata?: JSONObject): Kernel.IFuture;
    /**
     * Send an `is_complete_request` message.
     *
     * #### Notes
     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#code-completeness).
     *
     * Fulfills with the `is_complete_response` content when the shell reply is
     * received and validated.
     */
    requestIsComplete(content: KernelMessage.IIsCompleteRequest): Promise<KernelMessage.IIsCompleteReplyMsg>;
    /**
     * Send a `comm_info_request` message.
     *
     * #### Notes
     * Fulfills with the `comm_info_reply` content when the shell reply is
     * received and validated.
     */
    requestCommInfo(content: KernelMessage.ICommInfoRequest): Promise<KernelMessage.ICommInfoReplyMsg>;
    /**
     * Send an `input_reply` message.
     *
     * #### Notes
     * See [Messaging in Jupyter](https://jupyter-client.readthedocs.io/en/latest/messaging.html#messages-on-the-stdin-router-dealer-sockets).
     */
    sendInputReply(content: KernelMessage.IInputReply): void;
    /**
     * Connect to a comm, or create a new one.
     *
     * #### Notes
     * If a client-side comm already exists with the given commId, it is returned.
     */
    connectToComm(targetName: string, commId?: string): Kernel.IComm;
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
    registerCommTarget(targetName: string, callback: (comm: Kernel.IComm, msg: KernelMessage.ICommOpenMsg) => void | PromiseLike<void>): void;
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
    removeCommTarget(targetName: string, callback: (comm: Kernel.IComm, msg: KernelMessage.ICommOpenMsg) => void | PromiseLike<void>): void;
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
    registerMessageHook(msgId: string, hook: (msg: KernelMessage.IIOPubMessage) => boolean | PromiseLike<boolean>): void;
    /**
     * Remove an IOPub message hook.
     *
     * @param msg_id - The parent_header message id the hook intercepted.
     *
     * @param hook - The callback invoked for the message.
     *
     */
    removeMessageHook(msgId: string, hook: (msg: KernelMessage.IIOPubMessage) => boolean | PromiseLike<boolean>): void;
    /**
     * Handle a message with a display id.
     *
     * @returns Whether the message was handled.
     */
    private _handleDisplayId;
    /**
     * Clear the socket state.
     */
    private _clearSocket;
    /**
     * Handle status iopub messages from the kernel.
     */
    private _updateStatus;
    /**
     * Send pending messages to the kernel.
     */
    private _sendPending;
    /**
     * Clear the internal state.
     */
    private _clearState;
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
    private _assertCurrentMessage;
    /**
     * Handle a `comm_open` kernel message.
     */
    private _handleCommOpen;
    /**
     * Handle 'comm_close' kernel message.
     */
    private _handleCommClose;
    /**
     * Handle a 'comm_msg' kernel message.
     */
    private _handleCommMsg;
    /**
     * Unregister a comm instance.
     */
    private _unregisterComm;
    /**
     * Create the kernel websocket connection and add socket status handlers.
     */
    private _createSocket;
    /**
     * Handle a websocket open event.
     */
    private _onWSOpen;
    /**
     * Handle a websocket message, validating and routing appropriately.
     */
    private _onWSMessage;
    private _handleMessage;
    /**
     * Handle a websocket close event.
     */
    private _onWSClose;
    private _id;
    private _name;
    private _status;
    private _kernelSession;
    private _clientId;
    private _isDisposed;
    private _wsStopped;
    private _ws;
    private _username;
    private _reconnectLimit;
    private _reconnectAttempt;
    private _isReady;
    private _futures;
    private _comms;
    private _targetRegistry;
    private _info;
    private _pendingMessages;
    private _connectionPromise;
    private _specPromise;
    private _statusChanged;
    private _iopubMessage;
    private _anyMessage;
    private _unhandledMessage;
    private _displayIdToParentIds;
    private _msgIdToDisplayIds;
    private _terminated;
    private _msgChain;
    private _noOp;
}
/**
 * The namespace for `DefaultKernel` statics.
 */
export declare namespace DefaultKernel {
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
    function findById(id: string, settings?: ServerConnection.ISettings): Promise<Kernel.IModel>;
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
    function getSpecs(settings?: ServerConnection.ISettings): Promise<Kernel.ISpecModels>;
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
    function listRunning(settings?: ServerConnection.ISettings): Promise<Kernel.IModel[]>;
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
    function startNew(options: Kernel.IOptions): Promise<Kernel.IKernel>;
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
    function connectTo(model: Kernel.IModel, settings?: ServerConnection.ISettings): Kernel.IKernel;
    /**
     * Shut down a kernel by id.
     *
     * @param id - The id of the running kernel.
     *
     * @param settings - The server settings for the request.
     *
     * @returns A promise that resolves when the kernel is shut down.
     */
    function shutdown(id: string, settings?: ServerConnection.ISettings): Promise<void>;
    /**
     * Shut down all kernels.
     *
     * @param settings - The server settings to use.
     *
     * @returns A promise that resolves when all the kernels are shut down.
     */
    function shutdownAll(settings?: ServerConnection.ISettings): Promise<void>;
}
