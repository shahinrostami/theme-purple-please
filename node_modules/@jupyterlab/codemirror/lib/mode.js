"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const codeeditor_1 = require("@jupyterlab/codeeditor");
const codemirror_1 = __importDefault(require("codemirror"));
require("codemirror/mode/meta");
require("codemirror/addon/runmode/runmode");
require("./codemirror-ipython");
require("./codemirror-ipythongfm");
// Bundle other common modes
require("codemirror/mode/javascript/javascript");
require("codemirror/mode/css/css");
require("codemirror/mode/julia/julia");
require("codemirror/mode/r/r");
require("codemirror/mode/markdown/markdown");
require("codemirror/mode/clike/clike");
require("codemirror/mode/shell/shell");
require("codemirror/mode/sql/sql");
const coreutils_1 = require("@jupyterlab/coreutils");
/**
 * The namespace for CodeMirror Mode functionality.
 */
var Mode;
(function (Mode) {
    /**
     * Get the raw list of available modes specs.
     */
    function getModeInfo() {
        return codemirror_1.default.modeInfo;
    }
    Mode.getModeInfo = getModeInfo;
    /**
     * Running a CodeMirror mode outside of an editor.
     */
    function run(code, mode, el) {
        codemirror_1.default.runMode(code, mode, el);
    }
    Mode.run = run;
    /**
     * Ensure a codemirror mode is available by name or Codemirror spec.
     *
     * @param mode - The mode to ensure.  If it is a string, uses [findBest]
     *   to get the appropriate spec.
     *
     * @returns A promise that resolves when the mode is available.
     */
    function ensure(mode) {
        let spec = findBest(mode);
        // Simplest, cheapest check by mode name.
        if (codemirror_1.default.modes.hasOwnProperty(spec.mode)) {
            return Promise.resolve(spec);
        }
        // Fetch the mode asynchronously.
        return new Promise((resolve, reject) => {
            // An arrow function below seems to miscompile in our current webpack to
            // invalid js.
            require([`codemirror/mode/${spec.mode}/${spec.mode}.js`], function () {
                resolve(spec);
            });
        });
    }
    Mode.ensure = ensure;
    /**
     * Find a codemirror mode by name or CodeMirror spec.
     */
    function findBest(mode) {
        let modename = typeof mode === 'string' ? mode : mode.mode || mode.name;
        let mimetype = typeof mode !== 'string' ? mode.mime : modename;
        let ext = typeof mode !== 'string' ? mode.ext : [];
        return (codemirror_1.default.findModeByName(modename || '') ||
            codemirror_1.default.findModeByMIME(mimetype || '') ||
            findByExtension(ext) ||
            codemirror_1.default.findModeByMIME(codeeditor_1.IEditorMimeTypeService.defaultMimeType) ||
            codemirror_1.default.findModeByMIME('text/plain'));
    }
    Mode.findBest = findBest;
    /**
     * Find a codemirror mode by MIME.
     */
    function findByMIME(mime) {
        return codemirror_1.default.findModeByMIME(mime);
    }
    Mode.findByMIME = findByMIME;
    /**
     * Find a codemirror mode by name.
     */
    function findByName(name) {
        return codemirror_1.default.findModeByName(name);
    }
    Mode.findByName = findByName;
    /**
     * Find a codemirror mode by filename.
     */
    function findByFileName(name) {
        let basename = coreutils_1.PathExt.basename(name);
        return codemirror_1.default.findModeByFileName(basename);
    }
    Mode.findByFileName = findByFileName;
    /**
     * Find a codemirror mode by extension.
     */
    function findByExtension(ext) {
        if (typeof ext === 'string') {
            return codemirror_1.default.findModeByExtension(name);
        }
        for (let i = 0; i < ext.length; i++) {
            let mode = codemirror_1.default.findModeByExtension(ext[i]);
            if (mode) {
                return mode;
            }
        }
    }
    Mode.findByExtension = findByExtension;
})(Mode = exports.Mode || (exports.Mode = {}));
