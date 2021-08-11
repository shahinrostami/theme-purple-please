"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const berkeleydb_1 = require("./berkeleydb");
const rpm_1 = require("./rpm");
/**
 * Get a list of packages given a Buffer that contains an RPM database in BerkeleyDB format.
 * The database is inspected as best-effort, returning all valid/readable entries.
 * @param data An RPM database in BerkeleyDB format.
 * @deprecated Should use snyk/dep-graph. The response format is kept for backwards compatibility with snyk/kubernetes-monitor.
 */
async function getPackages(data) {
    try {
        const berkeleyDbValues = await berkeleydb_1.bufferToHashDbValues(data);
        let packagesSkipped = 0;
        let packagesProcessed = 0;
        const rpmPackageInfos = new Array();
        for (const entry of berkeleyDbValues) {
            try {
                const packageInfo = await rpm_1.bufferToPackageInfo(entry);
                if (packageInfo !== undefined) {
                    rpmPackageInfos.push(packageInfo);
                    packagesProcessed += 1;
                }
                else {
                    packagesSkipped += 1;
                }
            }
            catch (error) {
                packagesSkipped += 1;
            }
        }
        const formattedPackages = formatRpmPackages(rpmPackageInfos);
        const response = formattedPackages.join('\n');
        return {
            response,
            rpmMetadata: {
                packagesProcessed,
                packagesSkipped,
            },
        };
    }
    catch (error) {
        return {
            response: '',
            error,
        };
    }
}
exports.getPackages = getPackages;
function formatRpmPackages(packages) {
    return packages.map((packageInfo) => {
        if (packageInfo.epoch === undefined || packageInfo.epoch === 0) {
            return `${packageInfo.name}\t${packageInfo.version}-${packageInfo.release}\t${packageInfo.size}`;
        }
        else {
            return `${packageInfo.name}\t${packageInfo.epoch}:${packageInfo.version}-${packageInfo.release}\t${packageInfo.size}`;
        }
    });
}
//# sourceMappingURL=index.js.map