"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
const messaging_1 = require("@phosphor/messaging");
const observablemap_1 = require("./observablemap");
/**
 * A concrete Observable map for JSON data.
 */
class ObservableJSON extends observablemap_1.ObservableMap {
    /**
     * Construct a new observable JSON object.
     */
    constructor(options = {}) {
        super({
            itemCmp: coreutils_1.JSONExt.deepEqual,
            values: options.values
        });
    }
    /**
     * Serialize the model to JSON.
     */
    toJSON() {
        const out = Object.create(null);
        const keys = this.keys();
        for (let key of keys) {
            const value = this.get(key);
            if (value !== undefined) {
                out[key] = coreutils_1.JSONExt.deepCopy(value);
            }
        }
        return out;
    }
}
exports.ObservableJSON = ObservableJSON;
/**
 * The namespace for ObservableJSON static data.
 */
(function (ObservableJSON) {
    /**
     * An observable JSON change message.
     */
    class ChangeMessage extends messaging_1.Message {
        /**
         * Create a new metadata changed message.
         */
        constructor(args) {
            super('jsonvalue-changed');
            this.args = args;
        }
    }
    ObservableJSON.ChangeMessage = ChangeMessage;
})(ObservableJSON = exports.ObservableJSON || (exports.ObservableJSON = {}));
