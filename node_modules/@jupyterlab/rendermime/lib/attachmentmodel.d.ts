import { nbformat } from '@jupyterlab/coreutils';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { JSONObject, ReadonlyJSONObject } from '@phosphor/coreutils';
import { ISignal } from '@phosphor/signaling';
/**
 * The interface for an attachment model.
 */
export interface IAttachmentModel extends IRenderMime.IMimeModel {
    /**
     * A signal emitted when the attachment model changes.
     */
    readonly changed: ISignal<this, void>;
    /**
     * Dispose of the resources used by the attachment model.
     */
    dispose(): void;
    /**
     * Serialize the model to JSON.
     */
    toJSON(): nbformat.IMimeBundle;
}
/**
 * The namespace for IAttachmentModel sub-interfaces.
 */
export declare namespace IAttachmentModel {
    /**
     * The options used to create a notebook attachment model.
     */
    interface IOptions {
        /**
         * The raw attachment value.
         */
        value: nbformat.IMimeBundle;
    }
}
/**
 * The default implementation of a notebook attachment model.
 */
export declare class AttachmentModel implements IAttachmentModel {
    /**
     * Construct a new attachment model.
     */
    constructor(options: IAttachmentModel.IOptions);
    /**
     * A signal emitted when the attachment model changes.
     */
    readonly changed: ISignal<this, void>;
    /**
     * Dispose of the resources used by the attachment model.
     */
    dispose(): void;
    /**
     * The data associated with the model.
     */
    readonly data: ReadonlyJSONObject;
    /**
     * The metadata associated with the model.
     */
    readonly metadata: ReadonlyJSONObject;
    /**
     * Set the data associated with the model.
     *
     * #### Notes
     * Depending on the implementation of the mime model,
     * this call may or may not have deferred effects,
     */
    setData(options: IRenderMime.IMimeModel.ISetDataOptions): void;
    /**
     * Serialize the model to JSON.
     */
    toJSON(): nbformat.IMimeBundle;
    readonly trusted: boolean;
    /**
     * Update an observable JSON object using a readonly JSON object.
     */
    private _updateObservable;
    private _changed;
    private _raw;
    private _rawData;
    private _data;
}
/**
 * The namespace for AttachmentModel statics.
 */
export declare namespace AttachmentModel {
    /**
     * Get the data for an attachment.
     *
     * @params bundle - A kernel attachment MIME bundle.
     *
     * @returns - The data for the payload.
     */
    function getData(bundle: nbformat.IMimeBundle): JSONObject;
}
