"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const observables_1 = require("@jupyterlab/observables");
const coreutils_1 = require("@phosphor/coreutils");
const signaling_1 = require("@phosphor/signaling");
/**
 * The default implementation of a notebook attachment model.
 */
class AttachmentModel {
    /**
     * Construct a new attachment model.
     */
    constructor(options) {
        // All attachments are untrusted
        this.trusted = false;
        this._changed = new signaling_1.Signal(this);
        this._raw = {};
        let { data } = Private.getBundleOptions(options);
        this._data = new observables_1.ObservableJSON({ values: data });
        this._rawData = data;
        // Make a copy of the data.
        let value = options.value;
        for (let key in value) {
            // Ignore data and metadata that were stripped.
            switch (key) {
                case 'data':
                    break;
                default:
                    this._raw[key] = Private.extract(value, key);
            }
        }
    }
    /**
     * A signal emitted when the attachment model changes.
     */
    get changed() {
        return this._changed;
    }
    /**
     * Dispose of the resources used by the attachment model.
     */
    dispose() {
        this._data.dispose();
        signaling_1.Signal.clearData(this);
    }
    /**
     * The data associated with the model.
     */
    get data() {
        return this._rawData;
    }
    /**
     * The metadata associated with the model.
     */
    get metadata() {
        return undefined;
    }
    /**
     * Set the data associated with the model.
     *
     * #### Notes
     * Depending on the implementation of the mime model,
     * this call may or may not have deferred effects,
     */
    setData(options) {
        if (options.data) {
            this._updateObservable(this._data, options.data);
            this._rawData = options.data;
        }
        this._changed.emit(void 0);
    }
    /**
     * Serialize the model to JSON.
     */
    toJSON() {
        let attachment = {};
        for (let key in this._raw) {
            attachment[key] = Private.extract(this._raw, key);
        }
        return attachment;
    }
    /**
     * Update an observable JSON object using a readonly JSON object.
     */
    _updateObservable(observable, data) {
        let oldKeys = observable.keys();
        let newKeys = Object.keys(data);
        // Handle removed keys.
        for (let key of oldKeys) {
            if (newKeys.indexOf(key) === -1) {
                observable.delete(key);
            }
        }
        // Handle changed data.
        for (let key of newKeys) {
            let oldValue = observable.get(key);
            let newValue = data[key];
            if (oldValue !== newValue) {
                observable.set(key, newValue);
            }
        }
    }
}
exports.AttachmentModel = AttachmentModel;
/**
 * The namespace for AttachmentModel statics.
 */
(function (AttachmentModel) {
    /**
     * Get the data for an attachment.
     *
     * @params bundle - A kernel attachment MIME bundle.
     *
     * @returns - The data for the payload.
     */
    function getData(bundle) {
        return Private.getData(bundle);
    }
    AttachmentModel.getData = getData;
})(AttachmentModel = exports.AttachmentModel || (exports.AttachmentModel = {}));
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * Get the data from a notebook attachment.
     */
    function getData(bundle) {
        return convertBundle(bundle);
    }
    Private.getData = getData;
    /**
     * Get the bundle options given attachment model options.
     */
    function getBundleOptions(options) {
        let data = getData(options.value);
        return { data };
    }
    Private.getBundleOptions = getBundleOptions;
    /**
     * Extract a value from a JSONObject.
     */
    function extract(value, key) {
        let item = value[key];
        if (coreutils_1.JSONExt.isPrimitive(item)) {
            return item;
        }
        return coreutils_1.JSONExt.deepCopy(item);
    }
    Private.extract = extract;
    /**
     * Convert a mime bundle to mime data.
     */
    function convertBundle(bundle) {
        let map = Object.create(null);
        for (let mimeType in bundle) {
            map[mimeType] = extract(bundle, mimeType);
        }
        return map;
    }
})(Private || (Private = {}));
