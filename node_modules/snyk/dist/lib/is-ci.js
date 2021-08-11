"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCI = void 0;
const ciEnvs = new Set([
    'SNYK_CI',
    'CI',
    'CONTINUOUS_INTEGRATION',
    'BUILD_ID',
    'BUILD_NUMBER',
    'TEAMCITY_VERSION',
    'TRAVIS',
    'CIRCLECI',
    'JENKINS_URL',
    'HUDSON_URL',
    'bamboo.buildKey',
    'PHPCI',
    'GOCD_SERVER_HOST',
    'BUILDKITE',
    'TF_BUILD',
    'SYSTEM_TEAMFOUNDATIONSERVERURI',
]);
function isCI() {
    return Object.keys(process.env).some((key) => ciEnvs.has(key));
}
exports.isCI = isCI;
//# sourceMappingURL=is-ci.js.map