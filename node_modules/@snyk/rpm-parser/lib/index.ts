import { bufferToHashDbValues } from './berkeleydb';
import { bufferToPackageInfo } from './rpm';
import { PackageInfo } from './rpm/types';
import { IParserResponse } from './types';

/**
 * Get a list of packages given a Buffer that contains an RPM database in BerkeleyDB format.
 * The database is inspected as best-effort, returning all valid/readable entries.
 * @param data An RPM database in BerkeleyDB format.
 * @deprecated Should use snyk/dep-graph. The response format is kept for backwards compatibility with snyk/kubernetes-monitor.
 */
export async function getPackages(data: Buffer): Promise<IParserResponse> {
  try {
    const berkeleyDbValues = await bufferToHashDbValues(data);

    let packagesSkipped = 0;
    let packagesProcessed = 0;

    const rpmPackageInfos = new Array<PackageInfo>();
    for (const entry of berkeleyDbValues) {
      try {
        const packageInfo = await bufferToPackageInfo(entry);
        if (packageInfo !== undefined) {
          rpmPackageInfos.push(packageInfo);
          packagesProcessed += 1;
        } else {
          packagesSkipped += 1;
        }
      } catch (error) {
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
  } catch (error) {
    return {
      response: '',
      error,
    };
  }
}

function formatRpmPackages(packages: PackageInfo[]): string[] {
  return packages.map((packageInfo) => {
    if (packageInfo.epoch === undefined || packageInfo.epoch === 0) {
      return `${packageInfo.name}\t${packageInfo.version}-${packageInfo.release}\t${packageInfo.size}`;
    } else {
      return `${packageInfo.name}\t${packageInfo.epoch}:${packageInfo.version}-${packageInfo.release}\t${packageInfo.size}`;
    }
  });
}
