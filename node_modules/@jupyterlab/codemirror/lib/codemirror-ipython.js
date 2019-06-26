"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const codemirror_1 = __importDefault(require("codemirror"));
require("codemirror/mode/meta");
require("codemirror/mode/python/python");
/**
 * Define an IPython codemirror mode.
 *
 * It is a slightly altered Python Mode with a `?` operator.
 */
codemirror_1.default.defineMode('ipython', (config, modeOptions) => {
    let pythonConf = {};
    for (let prop in modeOptions) {
        if (modeOptions.hasOwnProperty(prop)) {
            pythonConf[prop] = modeOptions[prop];
        }
    }
    pythonConf.name = 'python';
    pythonConf.singleOperators = new RegExp('^[\\+\\-\\*/%&|@\\^~<>!\\?]');
    pythonConf.identifiers = new RegExp('^[_A-Za-z\u00A1-\uFFFF][_A-Za-z0-9\u00A1-\uFFFF]*');
    return codemirror_1.default.getMode(config, pythonConf);
}, 'python');
codemirror_1.default.defineMIME('text/x-ipython', 'ipython');
codemirror_1.default.modeInfo.push({
    ext: [],
    mime: 'text/x-ipython',
    mode: 'ipython',
    name: 'ipython'
});
