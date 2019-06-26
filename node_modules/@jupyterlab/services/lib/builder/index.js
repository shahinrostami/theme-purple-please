"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const serverconnection_1 = require("../serverconnection");
/**
 * The url for the lab build service.
 */
const BUILD_SETTINGS_URL = 'lab/api/build';
/**
 * The build API service manager.
 */
class BuildManager {
    /**
     * Create a new setting manager.
     */
    constructor(options = {}) {
        this.serverSettings =
            options.serverSettings || serverconnection_1.ServerConnection.makeSettings();
    }
    /**
     * Test whether the build service is available.
     */
    get isAvailable() {
        return coreutils_1.PageConfig.getOption('buildAvailable').toLowerCase() === 'true';
    }
    /**
     * Test whether to check build status automatically.
     */
    get shouldCheck() {
        return coreutils_1.PageConfig.getOption('buildCheck').toLowerCase() === 'true';
    }
    /**
     * Get whether the application should be built.
     */
    getStatus() {
        const base = this.serverSettings.baseUrl;
        const url = coreutils_1.URLExt.join(base, BUILD_SETTINGS_URL);
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
            if (typeof data.status !== 'string') {
                throw new Error('Invalid data');
            }
            if (typeof data.message !== 'string') {
                throw new Error('Invalid data');
            }
            return data;
        });
    }
    /**
     * Build the application.
     */
    build() {
        const base = this.serverSettings.baseUrl;
        const url = coreutils_1.URLExt.join(base, BUILD_SETTINGS_URL);
        const { serverSettings } = this;
        const init = { method: 'POST' };
        const promise = serverconnection_1.ServerConnection.makeRequest(url, init, serverSettings);
        return promise.then(response => {
            if (response.status === 400) {
                throw new serverconnection_1.ServerConnection.ResponseError(response, 'Build aborted');
            }
            if (response.status !== 200) {
                let message = `Build failed with ${response.status}, please run 'jupyter lab build' on the server for full output`;
                throw new serverconnection_1.ServerConnection.ResponseError(response, message);
            }
        });
    }
    /**
     * Cancel an active build.
     */
    cancel() {
        const base = this.serverSettings.baseUrl;
        const url = coreutils_1.URLExt.join(base, BUILD_SETTINGS_URL);
        const { serverSettings } = this;
        const init = { method: 'DELETE' };
        const promise = serverconnection_1.ServerConnection.makeRequest(url, init, serverSettings);
        return promise.then(response => {
            if (response.status !== 204) {
                throw new serverconnection_1.ServerConnection.ResponseError(response);
            }
        });
    }
}
exports.BuildManager = BuildManager;
