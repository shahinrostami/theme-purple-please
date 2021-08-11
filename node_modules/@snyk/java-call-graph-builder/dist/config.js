"use strict";
const snykConfig = require("snyk-config");
const path = require("path");
const config = snykConfig.loadConfig(path.join(__dirname, '..'));
module.exports = config;
//# sourceMappingURL=config.js.map