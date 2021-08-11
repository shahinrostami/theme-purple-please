"use strict";
const snykConfig = require("snyk-config");
const invalid_endpoint_config_error_1 = require("./errors/invalid-endpoint-config-error");
const user_config_1 = require("./user-config");
const url = require("url");
const DEFAULT_TIMEOUT = 5 * 60; // in seconds
// TODO: fix the types!
const config = snykConfig.loadConfig(__dirname + '/../..');
// allow user config override of the API endpoint
const endpoint = user_config_1.config.get('endpoint');
if (endpoint && endpoint !== config.API) {
    const parsedEndpoint = url.parse(endpoint);
    // Endpoint option must be a valid URL including protocol
    if (!parsedEndpoint || !parsedEndpoint.protocol || !parsedEndpoint.host) {
        throw new invalid_endpoint_config_error_1.InvalidEndpointConfigError();
    }
    console.warn('Using a custom API endpoint from `snyk config` (tip: it should contain path to `/api`):', endpoint);
    config.API = endpoint;
}
const disableSuggestions = user_config_1.config.get('disableSuggestions');
if (disableSuggestions) {
    config.disableSuggestions = disableSuggestions;
}
const org = user_config_1.config.get('org');
if (!config.org && org) {
    config.org = org;
}
// client request timeout
// to change, set this config key to the desired value in seconds
// invalid (non-numeric) value will fallback to the default
const timeout = user_config_1.config.get('timeout');
if (!config.timeout) {
    config.timeout = timeout && +timeout ? +timeout : DEFAULT_TIMEOUT;
}
// this is a bit of an assumption that our web site origin is the same
// as our API origin, but for now it's okay - RS 2015-10-16
if (!config.ROOT) {
    const apiUrl = url.parse(config.API);
    config.ROOT = apiUrl.protocol + '//' + apiUrl.host;
}
module.exports = config;
//# sourceMappingURL=config.js.map