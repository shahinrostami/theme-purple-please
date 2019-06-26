import { Kernel, KernelMessage, Session } from '@jupyterlab/services';
import { IterableOrArrayLike } from '@phosphor/algorithm';
import { IDisposable } from '@phosphor/disposable';
import { ISignal } from '@phosphor/signaling';
/**
 * The interface of client session object.
 *
 * The client session represents the link between
 * a path and its kernel for the duration of the lifetime
 * of the session object.  The session can have no current
 * kernel, and can start a new kernel at any time.
 */
export interface IClientSession extends IDisposable {
    /**
     * A signal emitted when the session is shut down.
     */
    readonly terminated: ISignal<this, void>;
    /**
     * A signal emitted when the kernel changes.
     */
    readonly kernelChanged: ISignal<this, Session.IKernelChangedArgs>;
    /**
     * A signal emitted when the kernel status changes.
     */
    readonly statusChanged: ISignal<this, Kernel.Status>;
    /**
     * A signal emitted for a kernel messages.
     */
    readonly iopubMessage: ISignal<this, KernelMessage.IMessage>;
    /**
     * A signal emitted for an unhandled kernel message.
     */
    readonly unhandledMessage: ISignal<this, KernelMessage.IMessage>;
    /**
     * A signal emitted when a session property changes.
     */
    readonly propertyChanged: ISignal<this, 'path' | 'name' | 'type'>;
    /**
     * The current kernel associated with the document.
     */
    readonly kernel: Kernel.IKernelConnection | null;
    /**
     * The current path associated with the client session.
     */
    readonly path: string;
    /**
     * The current name associated with the client session.
     */
    readonly name: string;
    /**
     * The type of the client session.
     */
    readonly type: string;
    /**
     * The current status of the client session.
     */
    readonly status: Kernel.Status;
    /**
     * Whether the session is ready.
     */
    readonly isReady: boolean;
    /**
     * A promise that is fulfilled when the session is ready.
     */
    readonly ready: Promise<void>;
    /**
     * The kernel preference.
     */
    kernelPreference: IClientSession.IKernelPreference;
    /**
     * The display name of the kernel.
     */
    readonly kernelDisplayName: string;
    /**
     * Change the current kernel associated with the document.
     */
    changeKernel(options: Partial<Kernel.IModel>): Promise<Kernel.IKernelConnection>;
    /**
     * Kill the kernel and shutdown the session.
     *
     * @returns A promise that resolves when the session is shut down.
     */
    shutdown(): Promise<void>;
    /**
     * Select a kernel for the session.
     */
    selectKernel(): Promise<void>;
    /**
     * Restart the session.
     *
     * @returns A promise that resolves with whether the kernel has restarted.
     *
     * #### Notes
     * If there is a running kernel, present a dialog.
     * If there is no kernel, we start a kernel with the last run
     * kernel name and resolves with `true`. If no kernel has been started,
     * this is a no-op, and resolves with `false`.
     */
    restart(): Promise<boolean>;
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
    setPath(path: string): Promise<void>;
    /**
     * Change the session name.
     */
    setName(name: string): Promise<void>;
    /**
     * Change the session type.
     */
    setType(type: string): Promise<void>;
}
/**
 * The namespace for Client Session related interfaces.
 */
export declare namespace IClientSession {
    /**
     * A kernel preference.
     */
    interface IKernelPreference {
        /**
         * The name of the kernel.
         */
        readonly name?: string;
        /**
         * The preferred kernel language.
         */
        readonly language?: string;
        /**
         * The id of an existing kernel.
         */
        readonly id?: string;
        /**
         * Whether to prefer starting a kernel.
         */
        readonly shouldStart?: boolean;
        /**
         * Whether a kernel can be started.
         */
        readonly canStart?: boolean;
        /**
         * Whether to auto-start the default kernel if no matching kernel is found.
         */
        readonly autoStartDefault?: boolean;
    }
}
/**
 * The default implementation of client session object.
 */
export declare class ClientSession implements IClientSession {
    /**
     * Construct a new client session.
     */
    constructor(options: ClientSession.IOptions);
    /**
     * A signal emitted when the session is shut down.
     */
    readonly terminated: ISignal<this, void>;
    /**
     * A signal emitted when the kernel changes.
     */
    readonly kernelChanged: ISignal<this, Session.IKernelChangedArgs>;
    /**
     * A signal emitted when the status changes.
     */
    readonly statusChanged: ISignal<this, Kernel.Status>;
    /**
     * A signal emitted for iopub kernel messages.
     */
    readonly iopubMessage: ISignal<this, KernelMessage.IMessage>;
    /**
     * A signal emitted for an unhandled kernel message.
     */
    readonly unhandledMessage: ISignal<this, KernelMessage.IMessage>;
    /**
     * A signal emitted when a session property changes.
     */
    readonly propertyChanged: ISignal<this, 'path' | 'name' | 'type'>;
    /**
     * The current kernel of the session.
     */
    readonly kernel: Kernel.IKernelConnection | null;
    /**
     * The current path of the session.
     */
    readonly path: string;
    /**
     * The current name of the session.
     */
    readonly name: string;
    /**
     * The type of the client session.
     */
    readonly type: string;
    /**
     * The kernel preference of the session.
     */
    kernelPreference: IClientSession.IKernelPreference;
    /**
     * The session manager used by the session.
     */
    readonly manager: Session.IManager;
    /**
     * The current status of the session.
     */
    readonly status: Kernel.Status;
    /**
     * Whether the session is ready.
     */
    readonly isReady: boolean;
    /**
     * A promise that is fulfilled when the session is ready.
     */
    readonly ready: Promise<void>;
    /**
     * The display name of the current kernel.
     */
    readonly kernelDisplayName: string;
    /**
     * Test whether the context is disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resources held by the context.
     */
    dispose(): void;
    /**
     * Change the current kernel associated with the document.
     */
    changeKernel(options: Partial<Kernel.IModel>): Promise<Kernel.IKernelConnection>;
    /**
     * Select a kernel for the session.
     */
    selectKernel(): Promise<void>;
    /**
     * Kill the kernel and shutdown the session.
     *
     * @returns A promise that resolves when the session is shut down.
     */
    shutdown(): Promise<void>;
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
    restart(): Promise<boolean>;
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
    setPath(path: string): Promise<void>;
    /**
     * Change the session name.
     */
    setName(name: string): Promise<void>;
    /**
     * Change the session type.
     */
    setType(type: string): Promise<void>;
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
    initialize(): Promise<void>;
    /**
     * Start the session if necessary.
     */
    private _startIfNecessary;
    /**
     * Change the kernel.
     */
    private _changeKernel;
    /**
     * Select a kernel.
     *
     * @param cancelable: whether the dialog should have a cancel button.
     */
    private _selectKernel;
    /**
     * Start a session and set up its signals.
     */
    private _startSession;
    /**
     * Handle a new session object.
     */
    private _handleNewSession;
    /**
     * Handle an error in session startup.
     */
    private _handleSessionError;
    /**
     * Handle a session termination.
     */
    private _onTerminated;
    /**
     * Handle a change to a session property.
     */
    private _onPropertyChanged;
    /**
     * Handle a change to the kernel.
     */
    private _onKernelChanged;
    /**
     * Handle a change to the session status.
     */
    private _onStatusChanged;
    /**
     * Handle an iopub message.
     */
    private _onIopubMessage;
    /**
     * Handle an unhandled message.
     */
    private _onUnhandledMessage;
    private _path;
    private _name;
    private _type;
    private _prevKernelName;
    private _kernelPreference;
    private _isDisposed;
    private _session;
    private _ready;
    private _initializing;
    private _isReady;
    private _terminated;
    private _kernelChanged;
    private _statusChanged;
    private _iopubMessage;
    private _unhandledMessage;
    private _propertyChanged;
    private _dialog;
    private _setBusy;
    private _busyDisposable;
}
/**
 * A namespace for `ClientSession` statics.
 */
export declare namespace ClientSession {
    /**
     * The options used to initialize a context.
     */
    interface IOptions {
        /**
         * A session manager instance.
         */
        manager: Session.IManager;
        /**
         * The initial path of the file.
         */
        path?: string;
        /**
         * The name of the session.
         */
        name?: string;
        /**
         * The type of the session.
         */
        type?: string;
        /**
         * A kernel preference.
         */
        kernelPreference?: IClientSession.IKernelPreference;
        /**
         * A function to call when the session becomes busy.
         */
        setBusy?: () => IDisposable;
    }
    /**
     * Restart a kernel if the user accepts the risk.
     *
     * Returns a promise resolving with whether the kernel was restarted.
     */
    function restartKernel(kernel: Kernel.IKernelConnection): Promise<boolean>;
    /**
     * An interface for populating a kernel selector.
     */
    interface IKernelSearch {
        /**
         * The Kernel specs.
         */
        specs: Kernel.ISpecModels | null;
        /**
         * The kernel preference.
         */
        preference: IClientSession.IKernelPreference;
        /**
         * The current running sessions.
         */
        sessions?: IterableOrArrayLike<Session.IModel>;
    }
    /**
     * Get the default kernel name given select options.
     */
    function getDefaultKernel(options: IKernelSearch): string | null;
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
    function populateKernelSelect(node: HTMLSelectElement, options: IKernelSearch): void;
}
