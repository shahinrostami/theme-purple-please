"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const serverconnection_1 = require("../serverconnection");
/**
 * The url for the lab settings service.
 */
const SERVICE_SETTINGS_URL = 'api/settings';
/**
 * The settings API service manager.
 */
class SettingManager {
    /**
     * Create a new setting manager.
     */
    constructor(options = {}) {
        this.serverSettings =
            options.serverSettings || serverconnection_1.ServerConnection.makeSettings();
    }
    /**
     * Fetch a plugin's settings.
     *
     * @param id - The plugin's ID.
     *
     * @returns A promise that resolves if successful.
     */
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { serverSettings } = this;
            const { baseUrl, pageUrl } = serverSettings;
            const { makeRequest, ResponseError } = serverconnection_1.ServerConnection;
            const base = baseUrl + pageUrl;
            const url = Private.url(base, id);
            const response = yield makeRequest(url, {}, serverSettings);
            if (response.status !== 200) {
                throw new ResponseError(response);
            }
            return response.json();
        });
    }
    /**
     * Save a plugin's settings.
     *
     * @param id - The plugin's ID.
     *
     * @param raw - The user setting values as a raw string of JSON with comments.
     *
     * @returns A promise that resolves if successful.
     */
    save(id, raw) {
        return __awaiter(this, void 0, void 0, function* () {
            const { serverSettings } = this;
            const { baseUrl, pageUrl } = serverSettings;
            const { makeRequest, ResponseError } = serverconnection_1.ServerConnection;
            const base = baseUrl + pageUrl;
            const url = Private.url(base, id);
            const init = { body: raw, method: 'PUT' };
            const response = yield makeRequest(url, init, serverSettings);
            if (response.status !== 204) {
                throw new ResponseError(response);
            }
        });
    }
}
exports.SettingManager = SettingManager;
/**
 * A namespace for private data.
 */
var Private;
(function (Private) {
    /**
     * Get the url for a plugin's settings.
     */
    function url(base, id) {
        return coreutils_1.URLExt.join(base, SERVICE_SETTINGS_URL, id);
    }
    Private.url = url;
})(Private || (Private = {}));
