"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const serverconnection_1 = require("../serverconnection");
/**
 * The url for the lab nbconvert service.
 */
const NBCONVERT_SETTINGS_URL = 'api/nbconvert';
/**
 * The nbconvert API service manager.
 */
class NbConvertManager {
    /**
     * Create a new nbconvert manager.
     */
    constructor(options = {}) {
        this.serverSettings =
            options.serverSettings || serverconnection_1.ServerConnection.makeSettings();
    }
    /**
     * Get whether the application should be built.
     */
    getExportFormats() {
        const base = this.serverSettings.baseUrl;
        const url = coreutils_1.URLExt.join(base, NBCONVERT_SETTINGS_URL);
        const { serverSettings } = this;
        const promise = serverconnection_1.ServerConnection.makeRequest(url, {}, serverSettings);
        return promise
            .then(response => {
            if (response.status !== 200) {
                throw new serverconnection_1.ServerConnection.ResponseError(response);
            }
            return response.json();
        })
            .then(data => {
            let exportList = {};
            let keys = Object.keys(data);
            keys.forEach(function (key) {
                let mimeType = data[key].output_mimetype;
                exportList[key] = { output_mimetype: mimeType };
            });
            return exportList;
        });
    }
}
exports.NbConvertManager = NbConvertManager;
