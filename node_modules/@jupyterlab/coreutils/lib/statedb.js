"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
const signaling_1 = require("@phosphor/signaling");
/* tslint:disable */
/**
 * The default state database token.
 */
exports.IStateDB = new coreutils_1.Token('@jupyterlab/coreutils:IStateDB');
/**
 * The default concrete implementation of a state database.
 */
class StateDB {
    /**
     * Create a new state database.
     *
     * @param options - The instantiation options for a state database.
     */
    constructor(options) {
        /**
         * The maximum allowed length of the data after it has been serialized.
         */
        this.maxLength = 2000;
        this._changed = new signaling_1.Signal(this);
        const { namespace, transform, windowName } = options;
        this.namespace = namespace;
        this._window = windowName || '';
        this._ready = (transform || Promise.resolve(null)).then(transformation => {
            if (!transformation) {
                return;
            }
            const { contents, type } = transformation;
            switch (type) {
                case 'cancel':
                    return;
                case 'clear':
                    this._clear();
                    return;
                case 'merge':
                    this._merge(contents || {});
                    return;
                case 'overwrite':
                    this._overwrite(contents || {});
                    return;
                default:
                    return;
            }
        });
    }
    /**
     * A signal that emits the change type any time a value changes.
     */
    get changed() {
        return this._changed;
    }
    /**
     * Clear the entire database.
     */
    clear(silent = false) {
        return this._ready.then(() => {
            this._clear();
            if (silent) {
                return;
            }
            this._changed.emit({ id: null, type: 'clear' });
        });
    }
    /**
     * Retrieve a saved bundle from the database.
     *
     * @param id - The identifier used to retrieve a data bundle.
     *
     * @returns A promise that bears a data payload if available.
     *
     * #### Notes
     * The `id` values of stored items in the state database are formatted:
     * `'namespace:identifier'`, which is the same convention that command
     * identifiers in JupyterLab use as well. While this is not a technical
     * requirement for `fetch()`, `remove()`, and `save()`, it *is* necessary for
     * using the `fetchNamespace()` method.
     *
     * The promise returned by this method may be rejected if an error occurs in
     * retrieving the data. Non-existence of an `id` will succeed with `null`.
     */
    fetch(id) {
        return this._ready.then(() => this._fetch(id));
    }
    /**
     * Retrieve all the saved bundles for a namespace.
     *
     * @param namespace - The namespace to retrieve.
     *
     * @returns A promise that bears a collection of payloads for a namespace.
     *
     * #### Notes
     * Namespaces are entirely conventional entities. The `id` values of stored
     * items in the state database are formatted: `'namespace:identifier'`, which
     * is the same convention that command identifiers in JupyterLab use as well.
     *
     * If there are any errors in retrieving the data, they will be logged to the
     * console in order to optimistically return any extant data without failing.
     * This promise will always succeed.
     */
    fetchNamespace(namespace) {
        return this._ready.then(() => {
            const prefix = `${this._window}:${this.namespace}:`;
            const mask = (key) => key.replace(prefix, '');
            return StateDB.fetchNamespace(`${prefix}${namespace}:`, mask);
        });
    }
    /**
     * Remove a value from the database.
     *
     * @param id - The identifier for the data being removed.
     *
     * @returns A promise that is rejected if remove fails and succeeds otherwise.
     */
    remove(id) {
        return this._ready.then(() => {
            this._remove(id);
            this._changed.emit({ id, type: 'remove' });
        });
    }
    /**
     * Save a value in the database.
     *
     * @param id - The identifier for the data being saved.
     *
     * @param value - The data being saved.
     *
     * @returns A promise that is rejected if saving fails and succeeds otherwise.
     *
     * #### Notes
     * The `id` values of stored items in the state database are formatted:
     * `'namespace:identifier'`, which is the same convention that command
     * identifiers in JupyterLab use as well. While this is not a technical
     * requirement for `fetch()`, `remove()`, and `save()`, it *is* necessary for
     * using the `fetchNamespace()` method.
     */
    save(id, value) {
        return this._ready.then(() => {
            this._save(id, value);
            this._changed.emit({ id, type: 'save' });
        });
    }
    /**
     * Return a serialized copy of the state database's entire contents.
     *
     * @returns A promise that bears the database contents as JSON.
     */
    toJSON() {
        return this._ready.then(() => {
            const prefix = `${this._window}:${this.namespace}:`;
            const mask = (key) => key.replace(prefix, '');
            return StateDB.toJSON(prefix, mask);
        });
    }
    /**
     * Clear the entire database.
     *
     * #### Notes
     * Unlike the public `clear` method, this method is synchronous.
     */
    _clear() {
        const { localStorage } = window;
        const prefix = `${this._window}:${this.namespace}:`;
        let i = localStorage.length;
        while (i) {
            let key = localStorage.key(--i);
            if (key && key.indexOf(prefix) === 0) {
                localStorage.removeItem(key);
            }
        }
    }
    /**
     * Fetch a value from the database.
     *
     * #### Notes
     * Unlike the public `fetch` method, this method is synchronous.
     */
    _fetch(id) {
        const key = `${this._window}:${this.namespace}:${id}`;
        const value = window.localStorage.getItem(key);
        if (value) {
            const envelope = JSON.parse(value);
            return envelope.v;
        }
        return undefined;
    }
    /**
     * Merge data into the state database.
     */
    _merge(contents) {
        Object.keys(contents).forEach(key => {
            this._save(key, contents[key]);
        });
    }
    /**
     * Overwrite the entire database with new contents.
     */
    _overwrite(contents) {
        this._clear();
        this._merge(contents);
    }
    /**
     * Remove a key in the database.
     *
     * #### Notes
     * Unlike the public `remove` method, this method is synchronous.
     */
    _remove(id) {
        const key = `${this._window}:${this.namespace}:${id}`;
        window.localStorage.removeItem(key);
    }
    /**
     * Save a key and its value in the database.
     *
     * #### Notes
     * Unlike the public `save` method, this method is synchronous.
     */
    _save(id, value) {
        const key = `${this._window}:${this.namespace}:${id}`;
        const envelope = { v: value };
        const serialized = JSON.stringify(envelope);
        const length = serialized.length;
        const max = this.maxLength;
        if (length > max) {
            throw new Error(`Data length (${length}) exceeds maximum (${max})`);
        }
        window.localStorage.setItem(key, serialized);
    }
}
exports.StateDB = StateDB;
/**
 * A namespace for StateDB statics.
 */
(function (StateDB) {
    /**
     * Retrieve all the saved bundles for a given namespace in local storage.
     *
     * @param prefix - The namespace to retrieve.
     *
     * @param mask - Optional mask function to transform each key retrieved.
     *
     * @returns A collection of data payloads for a given prefix.
     *
     * #### Notes
     * If there are any errors in retrieving the data, they will be logged to the
     * console in order to optimistically return any extant data without failing.
     */
    function fetchNamespace(namespace, mask = key => key) {
        const { localStorage } = window;
        let items = [];
        let i = localStorage.length;
        while (i) {
            let key = localStorage.key(--i);
            if (key && key.indexOf(namespace) === 0) {
                let value = localStorage.getItem(key);
                try {
                    let envelope = JSON.parse(value);
                    items.push({
                        id: mask(key),
                        value: envelope ? envelope.v : undefined
                    });
                }
                catch (error) {
                    console.warn(error);
                    localStorage.removeItem(key);
                }
            }
        }
        return items;
    }
    StateDB.fetchNamespace = fetchNamespace;
    /**
     * Return a serialized copy of a namespace's contents from local storage.
     *
     * @returns The namespace contents as JSON.
     */
    function toJSON(namespace, mask = key => key) {
        return fetchNamespace(namespace, mask).reduce((acc, val) => {
            acc[val.id] = val.value;
            return acc;
        }, {});
    }
    StateDB.toJSON = toJSON;
})(StateDB = exports.StateDB || (exports.StateDB = {}));
