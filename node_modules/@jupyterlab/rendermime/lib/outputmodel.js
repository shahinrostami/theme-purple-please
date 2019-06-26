"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
const coreutils_1 = require("@phosphor/coreutils");
const signaling_1 = require("@phosphor/signaling");
const coreutils_2 = require("@jupyterlab/coreutils");
const observables_1 = require("@jupyterlab/observables");
/**
 * The default implementation of a notebook output model.
 */
class OutputModel {
    /**
     * Construct a new output model.
     */
    constructor(options) {
        this._changed = new signaling_1.Signal(this);
        this._raw = {};
        let { data, metadata, trusted } = Private.getBundleOptions(options);
        this._data = new observables_1.ObservableJSON({ values: data });
        this._rawData = data;
        this._metadata = new observables_1.ObservableJSON({ values: metadata });
        this._rawMetadata = metadata;
        this.trusted = trusted;
        // Make a copy of the data.
        let value = options.value;
        for (let key in value) {
            // Ignore data and metadata that were stripped.
            switch (key) {
                case 'data':
                case 'metadata':
                    break;
                default:
                    this._raw[key] = Private.extract(value, key);
            }
        }
        this.type = value.output_type;
        if (coreutils_2.nbformat.isExecuteResult(value)) {
            this.executionCount = value.execution_count;
        }
        else {
            this.executionCount = null;
        }
    }
    /**
     * A signal emitted when the output model changes.
     */
    get changed() {
        return this._changed;
    }
    /**
     * Dispose of the resources used by the output model.
     */
    dispose() {
        this._data.dispose();
        this._metadata.dispose();
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
        return this._rawMetadata;
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
        if (options.metadata) {
            this._updateObservable(this._metadata, options.metadata);
            this._rawMetadata = options.metadata;
        }
        this._changed.emit(void 0);
    }
    /**
     * Serialize the model to JSON.
     */
    toJSON() {
        let output = {};
        for (let key in this._raw) {
            output[key] = Private.extract(this._raw, key);
        }
        switch (this.type) {
            case 'display_data':
            case 'execute_result':
            case 'update_display_data':
                output['data'] = this.data;
                output['metadata'] = this.metadata;
                break;
            default:
                break;
        }
        // Remove transient data.
        delete output['transient'];
        return output;
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
exports.OutputModel = OutputModel;
/**
 * The namespace for OutputModel statics.
 */
(function (OutputModel) {
    /**
     * Get the data for an output.
     *
     * @params output - A kernel output message payload.
     *
     * @returns - The data for the payload.
     */
    function getData(output) {
        return Private.getData(output);
    }
    OutputModel.getData = getData;
    /**
     * Get the metadata from an output message.
     *
     * @params output - A kernel output message payload.
     *
     * @returns - The metadata for the payload.
     */
    function getMetadata(output) {
        return Private.getMetadata(output);
    }
    OutputModel.getMetadata = getMetadata;
})(OutputModel = exports.OutputModel || (exports.OutputModel = {}));
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * Get the data from a notebook output.
     */
    function getData(output) {
        let bundle = {};
        if (coreutils_2.nbformat.isExecuteResult(output) ||
            coreutils_2.nbformat.isDisplayData(output) ||
            coreutils_2.nbformat.isDisplayUpdate(output)) {
            bundle = output.data;
        }
        else if (coreutils_2.nbformat.isStream(output)) {
            if (output.name === 'stderr') {
                bundle['application/vnd.jupyter.stderr'] = output.text;
            }
            else {
                bundle['application/vnd.jupyter.stdout'] = output.text;
            }
        }
        else if (coreutils_2.nbformat.isError(output)) {
            let traceback = output.traceback.join('\n');
            bundle['application/vnd.jupyter.stderr'] =
                traceback || `${output.ename}: ${output.evalue}`;
        }
        return convertBundle(bundle);
    }
    Private.getData = getData;
    /**
     * Get the metadata from an output message.
     */
    function getMetadata(output) {
        let value = Object.create(null);
        if (coreutils_2.nbformat.isExecuteResult(output) || coreutils_2.nbformat.isDisplayData(output)) {
            for (let key in output.metadata) {
                value[key] = extract(output.metadata, key);
            }
        }
        return value;
    }
    Private.getMetadata = getMetadata;
    /**
     * Get the bundle options given output model options.
     */
    function getBundleOptions(options) {
        let data = getData(options.value);
        let metadata = getMetadata(options.value);
        let trusted = !!options.trusted;
        return { data, metadata, trusted };
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
        return JSON.parse(JSON.stringify(item));
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
