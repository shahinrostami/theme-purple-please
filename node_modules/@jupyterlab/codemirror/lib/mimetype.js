"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const mode_1 = require("./mode");
/**
 * The mime type service for CodeMirror.
 */
class CodeMirrorMimeTypeService {
    /**
     * Returns a mime type for the given language info.
     *
     * #### Notes
     * If a mime type cannot be found returns the defaul mime type `text/plain`, never `null`.
     */
    getMimeTypeByLanguage(info) {
        let ext = info.file_extension || '';
        return mode_1.Mode.findBest(info.codemirror_mode || {
            mimetype: info.mimetype,
            name: info.name,
            ext: [ext.split('.').slice(-1)[0]]
        }).mime;
    }
    /**
     * Returns a mime type for the given file path.
     *
     * #### Notes
     * If a mime type cannot be found returns the default mime type `text/plain`, never `null`.
     */
    getMimeTypeByFilePath(path) {
        const ext = coreutils_1.PathExt.extname(path);
        if (ext === '.ipy') {
            return 'text/x-python';
        }
        else if (ext === '.md') {
            return 'text/x-ipythongfm';
        }
        let mode = mode_1.Mode.findByFileName(path) || mode_1.Mode.findBest('');
        return mode.mime;
    }
}
exports.CodeMirrorMimeTypeService = CodeMirrorMimeTypeService;
