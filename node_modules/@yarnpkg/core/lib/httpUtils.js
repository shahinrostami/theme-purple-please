"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.del = exports.post = exports.put = exports.get = exports.request = exports.Method = exports.getNetworkSettings = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const https_1 = require("https");
const http_1 = require("http");
const micromatch_1 = tslib_1.__importDefault(require("micromatch"));
const tunnel_1 = tslib_1.__importDefault(require("tunnel"));
const url_1 = require("url");
const cache = new Map();
const certCache = new Map();
const globalHttpAgent = new http_1.Agent({ keepAlive: true });
const globalHttpsAgent = new https_1.Agent({ keepAlive: true });
function parseProxy(specifier) {
    const url = new url_1.URL(specifier);
    const proxy = { host: url.hostname, headers: {} };
    if (url.port)
        proxy.port = Number(url.port);
    return { proxy };
}
async function getCachedCertificate(caFilePath) {
    let certificate = certCache.get(caFilePath);
    if (!certificate) {
        certificate = fslib_1.xfs.readFilePromise(caFilePath).then(cert => {
            certCache.set(caFilePath, cert);
            return cert;
        });
        certCache.set(caFilePath, certificate);
    }
    return certificate;
}
/**
 * Searches through networkSettings and returns the most specific match
 */
function getNetworkSettings(target, opts) {
    // Sort the config by key length to match on the most specific pattern
    const networkSettings = [...opts.configuration.get(`networkSettings`)].sort(([keyA], [keyB]) => {
        return keyB.length - keyA.length;
    });
    const mergedNetworkSettings = {
        enableNetwork: undefined,
        caFilePath: undefined,
        httpProxy: undefined,
        httpsProxy: undefined,
    };
    const mergableKeys = Object.keys(mergedNetworkSettings);
    const url = new url_1.URL(target);
    for (const [glob, config] of networkSettings) {
        if (micromatch_1.default.isMatch(url.hostname, glob)) {
            for (const key of mergableKeys) {
                const setting = config.get(key);
                if (setting !== null && typeof mergedNetworkSettings[key] === `undefined`) {
                    mergedNetworkSettings[key] = setting;
                }
            }
        }
    }
    // Apply defaults
    for (const key of mergableKeys) {
        if (typeof mergedNetworkSettings[key] === `undefined`) {
            mergedNetworkSettings[key] = opts.configuration.get(key);
        }
    }
    return mergedNetworkSettings;
}
exports.getNetworkSettings = getNetworkSettings;
var Method;
(function (Method) {
    Method["GET"] = "GET";
    Method["PUT"] = "PUT";
    Method["POST"] = "POST";
    Method["DELETE"] = "DELETE";
})(Method = exports.Method || (exports.Method = {}));
async function request(target, body, { configuration, headers, json, jsonRequest = json, jsonResponse = json, method = Method.GET }) {
    const networkConfig = getNetworkSettings(target, { configuration });
    if (networkConfig.enableNetwork === false)
        throw new Error(`Request to '${target}' has been blocked because of your configuration settings`);
    const url = new url_1.URL(target);
    if (url.protocol === `http:` && !micromatch_1.default.isMatch(url.hostname, configuration.get(`unsafeHttpWhitelist`)))
        throw new Error(`Unsafe http requests must be explicitly whitelisted in your configuration (${url.hostname})`);
    const agent = {
        http: networkConfig.httpProxy
            ? tunnel_1.default.httpOverHttp(parseProxy(networkConfig.httpProxy))
            : globalHttpAgent,
        https: networkConfig.httpsProxy
            ? tunnel_1.default.httpsOverHttp(parseProxy(networkConfig.httpsProxy))
            : globalHttpsAgent,
    };
    const gotOptions = { agent, headers, method };
    gotOptions.responseType = jsonResponse
        ? `json`
        : `buffer`;
    if (body !== null) {
        if (Buffer.isBuffer(body) || (!jsonRequest && typeof body === `string`)) {
            gotOptions.body = body;
        }
        else {
            // @ts-expect-error: The got types only allow an object, but got can stringify any valid JSON
            gotOptions.json = body;
        }
    }
    const socketTimeout = configuration.get(`httpTimeout`);
    const retry = configuration.get(`httpRetry`);
    const rejectUnauthorized = configuration.get(`enableStrictSsl`);
    const caFilePath = networkConfig.caFilePath;
    const { default: got } = await Promise.resolve().then(() => tslib_1.__importStar(require(`got`)));
    const certificateAuthority = caFilePath
        ? await getCachedCertificate(caFilePath)
        : undefined;
    const gotClient = got.extend({
        timeout: {
            socket: socketTimeout,
        },
        retry,
        https: {
            rejectUnauthorized,
            certificateAuthority,
        },
        ...gotOptions,
    });
    return configuration.getLimit(`networkConcurrency`)(() => {
        return gotClient(target);
    });
}
exports.request = request;
async function get(target, { configuration, json, jsonResponse = json, ...rest }) {
    let entry = cache.get(target);
    if (!entry) {
        entry = request(target, null, { configuration, ...rest }).then(response => {
            cache.set(target, response.body);
            return response.body;
        });
        cache.set(target, entry);
    }
    if (Buffer.isBuffer(entry) === false)
        entry = await entry;
    if (jsonResponse) {
        return JSON.parse(entry.toString());
    }
    else {
        return entry;
    }
}
exports.get = get;
async function put(target, body, options) {
    const response = await request(target, body, { ...options, method: Method.PUT });
    return response.body;
}
exports.put = put;
async function post(target, body, options) {
    const response = await request(target, body, { ...options, method: Method.POST });
    return response.body;
}
exports.post = post;
async function del(target, options) {
    const response = await request(target, null, { ...options, method: Method.DELETE });
    return response.body;
}
exports.del = del;
