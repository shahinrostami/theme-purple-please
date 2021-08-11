"use strict";
const version_1 = require("../../lib/version");
module.exports = async () => {
    let version = await version_1.getVersion();
    if (version_1.isStandaloneBuild()) {
        version += ' (standalone)';
    }
    return version;
};
//# sourceMappingURL=version.js.map