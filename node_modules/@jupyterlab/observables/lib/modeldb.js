"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const disposable_1 = require("@phosphor/disposable");
const signaling_1 = require("@phosphor/signaling");
const coreutils_1 = require("@phosphor/coreutils");
const observablemap_1 = require("./observablemap");
const observablejson_1 = require("./observablejson");
const observablestring_1 = require("./observablestring");
const undoablelist_1 = require("./undoablelist");
/**
 * A concrete implementation of an `IObservableValue`.
 */
class ObservableValue {
    /**
     * Constructor for the value.
     *
     * @param initialValue: the starting value for the `ObservableValue`.
     */
    constructor(initialValue = null) {
        this._value = null;
        this._changed = new signaling_1.Signal(this);
        this._isDisposed = false;
        this._value = initialValue;
    }
    /**
     * The observable type.
     */
    get type() {
        return 'Value';
    }
    /**
     * Whether the value has been disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * The changed signal.
     */
    get changed() {
        return this._changed;
    }
    /**
     * Get the current value, or `undefined` if it has not been set.
     */
    get() {
        return this._value;
    }
    /**
     * Set the current value.
     */
    set(value) {
        let oldValue = this._value;
        if (coreutils_1.JSONExt.deepEqual(oldValue, value)) {
            return;
        }
        this._value = value;
        this._changed.emit({
            oldValue: oldValue,
            newValue: value
        });
    }
    /**
     * Dispose of the resources held by the value.
     */
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        signaling_1.Signal.clearData(this);
        this._value = null;
    }
}
exports.ObservableValue = ObservableValue;
/**
 * The namespace for the `ObservableValue` class statics.
 */
(function (ObservableValue) {
    /**
     * The changed args object emitted by the `IObservableValue`.
     */
    class IChangedArgs {
    }
    ObservableValue.IChangedArgs = IChangedArgs;
})(ObservableValue = exports.ObservableValue || (exports.ObservableValue = {}));
/**
 * A concrete implementation of an `IModelDB`.
 */
class ModelDB {
    /**
     * Constructor for the `ModelDB`.
     */
    constructor(options = {}) {
        /**
         * Whether the model has been populated with
         * any model values.
         */
        this.isPrepopulated = false;
        /**
         * Whether the model is collaborative.
         */
        this.isCollaborative = false;
        /**
         * A promise resolved when the model is connected
         * to its backend. For the in-memory ModelDB it
         * is immediately resolved.
         */
        this.connected = Promise.resolve(void 0);
        this._toDispose = false;
        this._isDisposed = false;
        this._disposables = new disposable_1.DisposableSet();
        this._basePath = options.basePath || '';
        if (options.baseDB) {
            this._db = options.baseDB;
        }
        else {
            this._db = new observablemap_1.ObservableMap();
            this._toDispose = true;
        }
    }
    /**
     * The base path for the `ModelDB`. This is prepended
     * to all the paths that are passed in to the member
     * functions of the object.
     */
    get basePath() {
        return this._basePath;
    }
    /**
     * Whether the database is disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Get a value for a path.
     *
     * @param path: the path for the object.
     *
     * @returns an `IObservable`.
     */
    get(path) {
        return this._db.get(this._resolvePath(path));
    }
    /**
     * Whether the `IModelDB` has an object at this path.
     *
     * @param path: the path for the object.
     *
     * @returns a boolean for whether an object is at `path`.
     */
    has(path) {
        return this._db.has(this._resolvePath(path));
    }
    /**
     * Create a string and insert it in the database.
     *
     * @param path: the path for the string.
     *
     * @returns the string that was created.
     */
    createString(path) {
        let str = new observablestring_1.ObservableString();
        this._disposables.add(str);
        this.set(path, str);
        return str;
    }
    /**
     * Create an undoable list and insert it in the database.
     *
     * @param path: the path for the list.
     *
     * @returns the list that was created.
     *
     * #### Notes
     * The list can only store objects that are simple
     * JSON Objects and primitives.
     */
    createList(path) {
        let vec = new undoablelist_1.ObservableUndoableList(new undoablelist_1.ObservableUndoableList.IdentitySerializer());
        this._disposables.add(vec);
        this.set(path, vec);
        return vec;
    }
    /**
     * Create a map and insert it in the database.
     *
     * @param path: the path for the map.
     *
     * @returns the map that was created.
     *
     * #### Notes
     * The map can only store objects that are simple
     * JSON Objects and primitives.
     */
    createMap(path) {
        let map = new observablejson_1.ObservableJSON();
        this._disposables.add(map);
        this.set(path, map);
        return map;
    }
    /**
     * Create an opaque value and insert it in the database.
     *
     * @param path: the path for the value.
     *
     * @returns the value that was created.
     */
    createValue(path) {
        let val = new ObservableValue();
        this._disposables.add(val);
        this.set(path, val);
        return val;
    }
    /**
     * Get a value at a path, or `undefined if it has not been set
     * That value must already have been created using `createValue`.
     *
     * @param path: the path for the value.
     */
    getValue(path) {
        let val = this.get(path);
        if (!val || val.type !== 'Value') {
            throw Error('Can only call getValue for an ObservableValue');
        }
        return val.get();
    }
    /**
     * Set a value at a path. That value must already have
     * been created using `createValue`.
     *
     * @param path: the path for the value.
     *
     * @param value: the new value.
     */
    setValue(path, value) {
        let val = this.get(path);
        if (!val || val.type !== 'Value') {
            throw Error('Can only call setValue on an ObservableValue');
        }
        val.set(value);
    }
    /**
     * Create a view onto a subtree of the model database.
     *
     * @param basePath: the path for the root of the subtree.
     *
     * @returns an `IModelDB` with a view onto the original
     *   `IModelDB`, with `basePath` prepended to all paths.
     */
    view(basePath) {
        let view = new ModelDB({ basePath, baseDB: this });
        this._disposables.add(view);
        return view;
    }
    /**
     * Set a value at a path. Not intended to
     * be called by user code, instead use the
     * `create*` factory methods.
     *
     * @param path: the path to set the value at.
     *
     * @param value: the value to set at the path.
     */
    set(path, value) {
        this._db.set(this._resolvePath(path), value);
    }
    /**
     * Dispose of the resources held by the database.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        if (this._toDispose) {
            this._db.dispose();
        }
        this._disposables.dispose();
    }
    /**
     * Compute the fully resolved path for a path argument.
     */
    _resolvePath(path) {
        if (this._basePath) {
            path = this._basePath + '.' + path;
        }
        return path;
    }
}
exports.ModelDB = ModelDB;
