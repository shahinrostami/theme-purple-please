"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
var algorithm_1 = require("@phosphor/algorithm");
var signaling_1 = require("@phosphor/signaling");
/**
 * A disposable object which delegates to a callback function.
 */
var DisposableDelegate = /** @class */ (function () {
    /**
     * Construct a new disposable delegate.
     *
     * @param fn - The callback function to invoke on dispose.
     */
    function DisposableDelegate(fn) {
        this._fn = fn;
    }
    Object.defineProperty(DisposableDelegate.prototype, "isDisposed", {
        /**
         * Test whether the delegate has been disposed.
         */
        get: function () {
            return !this._fn;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Dispose of the delegate and invoke the callback function.
     */
    DisposableDelegate.prototype.dispose = function () {
        if (!this._fn) {
            return;
        }
        var fn = this._fn;
        this._fn = null;
        fn();
    };
    return DisposableDelegate;
}());
exports.DisposableDelegate = DisposableDelegate;
/**
 * An observable disposable object which delegates to a callback function.
 */
var ObservableDisposableDelegate = /** @class */ (function (_super) {
    __extends(ObservableDisposableDelegate, _super);
    function ObservableDisposableDelegate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._disposed = new signaling_1.Signal(_this);
        return _this;
    }
    Object.defineProperty(ObservableDisposableDelegate.prototype, "disposed", {
        /**
         * A signal emitted when the delegate is disposed.
         */
        get: function () {
            return this._disposed;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Dispose of the delegate and invoke the callback function.
     */
    ObservableDisposableDelegate.prototype.dispose = function () {
        if (this.isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
        this._disposed.emit(undefined);
        signaling_1.Signal.clearData(this);
    };
    return ObservableDisposableDelegate;
}(DisposableDelegate));
exports.ObservableDisposableDelegate = ObservableDisposableDelegate;
/**
 * An object which manages a collection of disposable items.
 */
var DisposableSet = /** @class */ (function () {
    /**
     * Construct a new disposable set.
     */
    function DisposableSet() {
        this._isDisposed = false;
        this._items = new Set();
    }
    Object.defineProperty(DisposableSet.prototype, "isDisposed", {
        /**
         * Test whether the set has been disposed.
         */
        get: function () {
            return this._isDisposed;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Dispose of the set and the items it contains.
     *
     * #### Notes
     * Items are disposed in the order they are added to the set.
     */
    DisposableSet.prototype.dispose = function () {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._items.forEach(function (item) { item.dispose(); });
        this._items.clear();
    };
    /**
     * Test whether the set contains a specific item.
     *
     * @param item - The item of interest.
     *
     * @returns `true` if the set contains the item, `false` otherwise.
     */
    DisposableSet.prototype.contains = function (item) {
        return this._items.has(item);
    };
    /**
     * Add a disposable item to the set.
     *
     * @param item - The item to add to the set.
     *
     * #### Notes
     * If the item is already contained in the set, this is a no-op.
     */
    DisposableSet.prototype.add = function (item) {
        this._items.add(item);
    };
    /**
     * Remove a disposable item from the set.
     *
     * @param item - The item to remove from the set.
     *
     * #### Notes
     * If the item is not contained in the set, this is a no-op.
     */
    DisposableSet.prototype.remove = function (item) {
        this._items.delete(item);
    };
    /**
     * Remove all items from the set.
     */
    DisposableSet.prototype.clear = function () {
        this._items.clear();
    };
    return DisposableSet;
}());
exports.DisposableSet = DisposableSet;
/**
 * The namespace for the `DisposableSet` class statics.
 */
(function (DisposableSet) {
    /**
     * Create a disposable set from an iterable of items.
     *
     * @param items - The iterable or array-like object of interest.
     *
     * @returns A new disposable initialized with the given items.
     */
    function from(items) {
        var set = new DisposableSet();
        algorithm_1.each(items, function (item) { set.add(item); });
        return set;
    }
    DisposableSet.from = from;
})(DisposableSet = exports.DisposableSet || (exports.DisposableSet = {}));
exports.DisposableSet = DisposableSet;
/**
 * An observable object which manages a collection of disposable items.
 */
var ObservableDisposableSet = /** @class */ (function (_super) {
    __extends(ObservableDisposableSet, _super);
    function ObservableDisposableSet() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._disposed = new signaling_1.Signal(_this);
        return _this;
    }
    Object.defineProperty(ObservableDisposableSet.prototype, "disposed", {
        /**
         * A signal emitted when the set is disposed.
         */
        get: function () {
            return this._disposed;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Dispose of the set and the items it contains.
     *
     * #### Notes
     * Items are disposed in the order they are added to the set.
     */
    ObservableDisposableSet.prototype.dispose = function () {
        if (this.isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
        this._disposed.emit(undefined);
        signaling_1.Signal.clearData(this);
    };
    return ObservableDisposableSet;
}(DisposableSet));
exports.ObservableDisposableSet = ObservableDisposableSet;
/**
 * The namespace for the `ObservableDisposableSet` class statics.
 */
(function (ObservableDisposableSet) {
    /**
     * Create an observable disposable set from an iterable of items.
     *
     * @param items - The iterable or array-like object of interest.
     *
     * @returns A new disposable initialized with the given items.
     */
    function from(items) {
        var set = new ObservableDisposableSet();
        algorithm_1.each(items, function (item) { set.add(item); });
        return set;
    }
    ObservableDisposableSet.from = from;
})(ObservableDisposableSet = exports.ObservableDisposableSet || (exports.ObservableDisposableSet = {}));
exports.ObservableDisposableSet = ObservableDisposableSet;
