/// <reference types="react" />
import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';
import { ServiceManager } from '@jupyterlab/services';
import { ITranslator } from '@jupyterlab/translation';
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
    render(): JSX.Element | null;
    /**
     * Dispose of the status item.
     */
    dispose(): void;
    /**
     * Set the number of kernel sessions when the list changes.
     */
    private _onSessionsRunningChanged;
    /**
     * Set the number of terminal sessions when the list changes.
     */
    private _onTerminalsRunningChanged;
    protected translator: ITranslator;
    private _trans;
    private _handleClick;
    private _serviceManager;
}
/**
 * A namespace for RunningSessions statics.
 */
export declare namespace RunningSessions {
    /**
     * A VDomModel for the RunningSessions status item.
     */
    class Model extends VDomModel {
        /**
         * The number of active kernel sessions.
         */
        get sessions(): number;
        set sessions(sessions: number);
        /**
         * The number of active terminal sessions.
         */
        get terminals(): number;
        set terminals(terminals: number);
        private _terminals;
        private _sessions;
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
         * A click handler for the item. By default this is used
         * to activate the running sessions side panel.
         */
        onClick: () => void;
        /**
         * The application language translator.
         */
        translator?: ITranslator;
    }
}
