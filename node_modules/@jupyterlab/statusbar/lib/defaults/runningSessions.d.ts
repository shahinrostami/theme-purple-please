/// <reference types="react" />
import { VDomRenderer, VDomModel } from '@jupyterlab/apputils';
import { ServiceManager } from '@jupyterlab/services';
/**
 * A VDomRenderer for a RunningSessions status item.
 */
export declare class RunningSessions extends VDomRenderer<RunningSessions.Model> {
    /**
     * Create a new RunningSessions widget.
     */
    constructor(opts: RunningSessions.IOptions);
    /**
     * Render the running sessions widget.
     */
    render(): JSX.Element;
    /**
     * Dispose of the status item.
     */
    dispose(): void;
    /**
     * Set the number of model kernels when the list changes.
     */
    private _onKernelsRunningChanged;
    /**
     * Set the number of model terminal sessions when the list changes.
     */
    private _onTerminalsRunningChanged;
    private _handleClick;
    private _serviceManager;
}
/**
 * A namespace for RunninSessions statics.
 */
export declare namespace RunningSessions {
    /**
     * A VDomModel for the RunninSessions status item.
     */
    class Model extends VDomModel {
        /**
         * The number of active kernels.
         */
        kernels: number;
        /**
         * The number of active terminal sessions.
         */
        terminals: number;
        private _terminals;
        private _kernels;
    }
    /**
     * Options for creating a RunningSessions item.
     */
    interface IOptions {
        /**
         * The application service manager.
         */
        serviceManager: ServiceManager;
        /**
         * A click handler for the item. By defult this is used
         * to activate the running sessions side panel.
         */
        onClick: () => void;
    }
}
