"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const codemirror_1 = __importDefault(require("codemirror"));
require("codemirror/mode/stex/stex");
require("codemirror/mode/gfm/gfm");
require("codemirror/addon/mode/multiplex");
/**
 * Define an IPython GFM (GitHub Flavored Markdown) mode.
 *
 * Is just a slightly altered GFM Mode with support for LaTeX.
 * LaTeX support was supported by Codemirror GFM as of
 *   https://github.com/codemirror/CodeMirror/pull/567
 *  But was later removed in
 *   https://github.com/codemirror/CodeMirror/commit/d9c9f1b1ffe984aee41307f3e927f80d1f23590c
 */
codemirror_1.default.defineMode('ipythongfm', (config, modeOptions) => {
    let gfmMode = codemirror_1.default.getMode(config, {
        name: 'gfm',
        // Override list3 with an under-used token, rather than `keyword`
        tokenTypeOverrides: { list3: 'string-2' }
    });
    let texMode = codemirror_1.default.getMode(config, {
        name: 'stex',
        inMathMode: true
    });
    return codemirror_1.default.multiplexingMode(gfmMode, {
        open: '$$',
        close: '$$',
        mode: texMode,
        delimStyle: 'delimit'
    }, {
        open: '$',
        close: '$',
        mode: texMode,
        delimStyle: 'delimit'
    }, {
        open: '\\(',
        close: '\\)',
        mode: texMode,
        delimStyle: 'delimit'
    }, {
        open: '\\[',
        close: '\\]',
        mode: texMode,
        delimStyle: 'delimit'
    }
    // .. more multiplexed styles can follow here
    );
}, 'gfm');
codemirror_1.default.defineMIME('text/x-ipythongfm', 'ipythongfm');
codemirror_1.default.modeInfo.push({
    ext: [],
    mime: 'text/x-ipythongfm',
    mode: 'ipythongfm',
    name: 'ipythongfm'
});
