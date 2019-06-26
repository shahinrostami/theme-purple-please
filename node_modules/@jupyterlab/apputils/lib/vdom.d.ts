import { IDisposable } from '@phosphor/disposable';
import { Message } from '@phosphor/messaging';
import { ISignal, Signal } from '@phosphor/signaling';
import { Widget } from '@phosphor/widgets';
import * as React from 'react';
/**
 * Phosphor widget that encodes best practices for VDOM based rendering.
 */
export declare abstract class VDomRenderer<T extends VDomRenderer.IModel | null> extends Widget {
    /**
     * A signal emitted when the model changes.
     */
    readonly modelChanged: ISignal<this, void>;
    /**
     * Set the model and fire changed signals.
     */
    /**
    * Get the current model.
    */
    model: T | null;
    /**
     * Dispose this widget.
     */
    dispose(): void;
    /**
     * Called to update the state of the widget.
     *
     * The default implementation of this method triggers
     * VDOM based rendering by calling the this.render() method.
     */
    protected onUpdateRequest(msg: Message): void;
    protected onAfterAttach(msg: Message): void;
    /**
     * Render the content of this widget using the virtual DOM.
     *
     * This method will be called anytime the widget needs to be rendered,
     * which includes layout triggered rendering and all model changes.
     *
     * Subclasses should define this method and use the current model state
     * to create a virtual node or nodes to render.
     */
    protected abstract render(): Array<React.ReactElement<any>> | React.ReactElement<any> | null;
    private _model;
    private _modelChanged;
}
/**
 * Phosphor widget that renders React Element(s).
 *
 * All messages will re-render the element.
 */
export declare class ReactElementWidget extends VDomRenderer<any> {
    /**
     * Creates a Phosphor widget that renders the element(s) `es`.
     */
    constructor(es: Array<React.ReactElement<any>> | React.ReactElement<any> | null);
    render(): Array<React.ReactElement<any>> | React.ReactElement<any> | null;
    private _es;
}
/**
 * The namespace for VDomRenderer statics.
 */
export declare namespace VDomRenderer {
    /**
     * An interface for a model to be used with vdom rendering.
     */
    interface IModel extends IDisposable {
        /**
         * A signal emitted when any model state changes.
         */
        readonly stateChanged: ISignal<this, void>;
    }
}
/**
 * Concrete implementation of VDomRenderer model.
 */
export declare class VDomModel implements VDomRenderer.IModel {
    /**
     * A signal emitted when any model state changes.
     */
    readonly stateChanged: Signal<this, void>;
    /**
     * Test whether the model is disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose the model.
     */
    dispose(): void;
    private _isDisposed;
}
