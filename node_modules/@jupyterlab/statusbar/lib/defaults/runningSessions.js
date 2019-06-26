// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import React from 'react';
import { VDomRenderer, VDomModel } from '@jupyterlab/apputils';
import { GroupItem, IconItem, interactiveItem, TextItem } from '..';
/**
 * Half spacing between subitems in a status item.
 */
const HALF_SPACING = 4;
/**
 * A pure functional component for rendering kernel and terminal sessions.
 *
 * @param props: the props for the component.
 *
 * @returns a tsx component for the running sessions.
 */
function RunningSessionsComponent(props) {
    return (React.createElement(GroupItem, { spacing: HALF_SPACING, onClick: props.handleClick },
        React.createElement(GroupItem, { spacing: HALF_SPACING },
            React.createElement(TextItem, { source: props.terminals }),
            React.createElement(IconItem, { source: 'jp-StatusItem-terminal' })),
        React.createElement(GroupItem, { spacing: HALF_SPACING },
            React.createElement(TextItem, { source: props.kernels }),
            React.createElement(IconItem, { source: 'jp-StatusItem-kernel' }))));
}
/**
 * A VDomRenderer for a RunningSessions status item.
 */
export class RunningSessions extends VDomRenderer {
    /**
     * Create a new RunningSessions widget.
     */
    constructor(opts) {
        super();
        this._serviceManager = opts.serviceManager;
        this._handleClick = opts.onClick;
        this._serviceManager.sessions.runningChanged.connect(this._onKernelsRunningChanged, this);
        this._serviceManager.terminals.runningChanged.connect(this._onTerminalsRunningChanged, this);
        this.model = new RunningSessions.Model();
        this.addClass(interactiveItem);
    }
    /**
     * Render the running sessions widget.
     */
    render() {
        if (!this.model) {
            return null;
        }
        this.title.caption = `${this.model.terminals} Terminals, ${this.model.kernels} Kernels`;
        return (React.createElement(RunningSessionsComponent, { kernels: this.model.kernels, terminals: this.model.terminals, handleClick: this._handleClick }));
    }
    /**
     * Dispose of the status item.
     */
    dispose() {
        super.dispose();
        this._serviceManager.sessions.runningChanged.disconnect(this._onKernelsRunningChanged, this);
        this._serviceManager.terminals.runningChanged.disconnect(this._onTerminalsRunningChanged, this);
    }
    /**
     * Set the number of model kernels when the list changes.
     */
    _onKernelsRunningChanged(manager, kernels) {
        this.model.kernels = kernels.length;
    }
    /**
     * Set the number of model terminal sessions when the list changes.
     */
    _onTerminalsRunningChanged(manager, terminals) {
        this.model.terminals = terminals.length;
    }
}
/**
 * A namespace for RunninSessions statics.
 */
(function (RunningSessions) {
    /**
     * A VDomModel for the RunninSessions status item.
     */
    class Model extends VDomModel {
        constructor() {
            super(...arguments);
            this._terminals = 0;
            this._kernels = 0;
        }
        /**
         * The number of active kernels.
         */
        get kernels() {
            return this._kernels;
        }
        set kernels(kernels) {
            const oldKernels = this._kernels;
            this._kernels = kernels;
            if (oldKernels !== this._kernels) {
                this.stateChanged.emit(void 0);
            }
        }
        /**
         * The number of active terminal sessions.
         */
        get terminals() {
            return this._terminals;
        }
        set terminals(terminals) {
            const oldTerminals = this._terminals;
            this._terminals = terminals;
            if (oldTerminals !== this._terminals) {
                this.stateChanged.emit(void 0);
            }
        }
    }
    RunningSessions.Model = Model;
})(RunningSessions || (RunningSessions = {}));
//# sourceMappingURL=runningSessions.js.map