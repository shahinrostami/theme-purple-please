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
 * The url for the lab workspaces service.
 */
const SERVICE_WORKSPACES_URL = 'api/workspaces';
/**
 * The workspaces API service manager.
 */
class WorkspaceManager {
    /**
     * Create a new workspace manager.
     */
    constructor(options = {}) {
        this.serverSettings =
            options.serverSettings || serverconnection_1.ServerConnection.makeSettings();
    }
    /**
     * Fetch a workspace.
     *
     * @param id - The workspaces's ID.
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
     * Fetch the list of workspace IDs that exist on the server.
     *
     * @returns A promise that resolves if successful.
     */
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            const { serverSettings } = this;
            const { baseUrl, pageUrl } = serverSettings;
            const { makeRequest, ResponseError } = serverconnection_1.ServerConnection;
            const base = baseUrl + pageUrl;
            const url = Private.url(base, '');
            const response = yield makeRequest(url, {}, serverSettings);
            if (response.status !== 200) {
                throw new ResponseError(response);
            }
            const result = yield response.json();
            return result.workspaces;
        });
    }
    /**
     * Remove a workspace from the server.
     *
     * @param id - The workspaces's ID.
     *
     * @returns A promise that resolves if successful.
     */
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { serverSettings } = this;
            const { baseUrl, pageUrl } = serverSettings;
            const { makeRequest, ResponseError } = serverconnection_1.ServerConnection;
            const base = baseUrl + pageUrl;
            const url = Private.url(base, id);
            const init = { method: 'DELETE' };
            const response = yield makeRequest(url, init, serverSettings);
            if (response.status !== 204) {
                throw new ResponseError(response);
            }
        });
    }
    /**
     * Save a workspace.
     *
     * @param id - The workspace's ID.
     *
     * @param workspace - The workspace being saved.
     *
     * @returns A promise that resolves if successful.
     */
    save(id, workspace) {
        return __awaiter(this, void 0, void 0, function* () {
            const { serverSettings } = this;
            const { baseUrl, pageUrl } = serverSettings;
            const { makeRequest, ResponseError } = serverconnection_1.ServerConnection;
            const base = baseUrl + pageUrl;
            const url = Private.url(base, id);
            const init = { body: JSON.stringify(workspace), method: 'PUT' };
            const response = yield makeRequest(url, init, serverSettings);
            if (response.status !== 204) {
                throw new ResponseError(response);
            }
        });
    }
}
exports.WorkspaceManager = WorkspaceManager;
/**
 * A namespace for private data.
 */
var Private;
(function (Private) {
    /**
     * Get the url for a workspace.
     */
    function url(base, id) {
        return coreutils_1.URLExt.join(base, SERVICE_WORKSPACES_URL, id);
    }
    Private.url = url;
})(Private || (Private = {}));
