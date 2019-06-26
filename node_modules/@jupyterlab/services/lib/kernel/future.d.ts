import { DisposableDelegate } from '@phosphor/disposable';
import { Kernel } from './kernel';
import { KernelMessage } from './messages';
/**
 * Implementation of a kernel future.
 *
 * If a reply is expected, the Future is considered done when both a `reply`
 * message and an `idle` iopub status message have been received.  Otherwise, it
 * is considered done when the `idle` status is received.
 *
 */
export declare class KernelFutureHandler extends DisposableDelegate implements Kernel.IFuture {
    /**
     * Construct a new KernelFutureHandler.
     */
    constructor(cb: () => void, msg: KernelMessage.IShellMessage, expectReply: boolean, disposeOnDone: boolean, kernel: Kernel.IKernel);
    /**
     * Get the original outgoing message.
     */
    readonly msg: KernelMessage.IShellMessage;
    /**
     * A promise that resolves when the future is done.
     */
    readonly done: Promise<KernelMessage.IShellMessage>;
    /**
     * Get the reply handler.
     */
    /**
    * Set the reply handler.
    */
    onReply: (msg: KernelMessage.IShellMessage) => void | PromiseLike<void>;
    /**
     * Get the iopub handler.
     */
    /**
    * Set the iopub handler.
    */
    onIOPub: (msg: KernelMessage.IIOPubMessage) => void | PromiseLike<void>;
    /**
     * Get the stdin handler.
     */
    /**
    * Set the stdin handler.
    */
    onStdin: (msg: KernelMessage.IStdinMessage) => void | PromiseLike<void>;
    /**
     * Register hook for IOPub messages.
     *
     * @param hook - The callback invoked for an IOPub message.
     *
     * #### Notes
     * The IOPub hook system allows you to preempt the handlers for IOPub
     * messages handled by the future.
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
     */
    registerMessageHook(hook: (msg: KernelMessage.IIOPubMessage) => boolean | PromiseLike<boolean>): void;
    /**
     * Remove a hook for IOPub messages.
     *
     * @param hook - The hook to remove.
     *
     * #### Notes
     * If a hook is removed during the hook processing, it will be deactivated immediately.
     */
    removeMessageHook(hook: (msg: KernelMessage.IIOPubMessage) => boolean | PromiseLike<boolean>): void;
    /**
     * Send an `input_reply` message.
     */
    sendInputReply(content: KernelMessage.IInputReply): void;
    /**
     * Dispose and unregister the future.
     */
    dispose(): void;
    /**
     * Handle an incoming kernel message.
     */
    handleMsg(msg: KernelMessage.IMessage): Promise<void>;
    private _handleReply;
    private _handleStdin;
    private _handleIOPub;
    private _handleDone;
    /**
     * Test whether the given future flag is set.
     */
    private _testFlag;
    /**
     * Set the given future flag.
     */
    private _setFlag;
    private _msg;
    private _status;
    private _stdin;
    private _iopub;
    private _reply;
    private _done;
    private _replyMsg;
    private _hooks;
    private _disposeOnDone;
    private _kernel;
}
