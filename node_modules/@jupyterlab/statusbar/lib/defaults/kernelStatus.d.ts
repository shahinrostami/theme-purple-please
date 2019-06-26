/// <reference types="react" />
import { IClientSession, VDomRenderer, VDomModel } from '@jupyterlab/apputils';
import { Kernel } from '@jupyterlab/services';
/**
 * A VDomRenderer widget for displaying the status of a kernel.
 */
export declare class KernelStatus extends VDomRenderer<KernelStatus.Model> {
    /**
     * Construct the kernel status widget.
     */
    constructor(opts: KernelStatus.IOptions);
    /**
     * Render the kernel status item.
     */
    render(): JSX.Element;
    private _handleClick;
}
/**
 * A namespace for KernelStatus statics.
 */
export declare namespace KernelStatus {
    /**
     * A VDomModel for the kernel status indicator.
     */
    class Model extends VDomModel {
        /**
         * The name of the kernel.
         */
        readonly kernelName: string;
        /**
         * The current status of the kernel.
         */
        readonly status: Kernel.Status;
        /**
         * A display name for the activity.
         */
        activityName: string;
        /**
         * The current client session associated with the kernel status indicator.
         */
        session: IClientSession | null;
        /**
         * React to changes to the kernel status.
         */
        private _onKernelStatusChanged;
        /**
         * React to changes in the kernel.
         */
        private _onKernelChanged;
        private _getAllState;
        private _triggerChange;
        private _activityName;
        private _kernelName;
        private _kernelStatus;
        private _session;
    }
    /**
     * Options for creating a KernelStatus object.
     */
    interface IOptions {
        /**
         * A click handler for the item. By default
         * we launch a kernel selection dialog.
         */
        onClick: () => void;
    }
}
