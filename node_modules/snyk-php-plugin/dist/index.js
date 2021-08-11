"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const composerLockFileParser = require("@snyk/composer-lockfile-parser");
const system_deps_1 = require("./system-deps");
const PLUGIN_NAME = 'snyk-php-plugin';
function inspect(basePath, fileName, options = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const systemVersions = system_deps_1.systemDeps(basePath, options);
        const depsTree = composerLockFileParser.buildDepTreeFromFiles(basePath, fileName, systemVersions, options.dev);
        return Promise.resolve({
            package: depsTree,
            plugin: { name: PLUGIN_NAME, targetFile: fileName },
        });
    });
}
exports.inspect = inspect;
//# sourceMappingURL=index.js.map