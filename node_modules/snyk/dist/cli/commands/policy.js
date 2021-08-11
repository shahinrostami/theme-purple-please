"use strict";
const policy = require("snyk-policy");
const display_policy_1 = require("../../lib/display-policy");
const errors_1 = require("../../lib/errors");
async function displayPolicy(path) {
    try {
        const loadedPolicy = (await policy.load(path || process.cwd()));
        return await display_policy_1.display(loadedPolicy);
    }
    catch (error) {
        let adaptedError;
        if (error.code === 'ENOENT') {
            adaptedError = new errors_1.PolicyNotFoundError();
        }
        else {
            adaptedError = new errors_1.FailedToLoadPolicyError();
            adaptedError.innerError = error;
        }
        throw adaptedError;
    }
}
module.exports = displayPolicy;
//# sourceMappingURL=policy.js.map