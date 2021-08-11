import { PackageInfo } from './types';
import { headerImport } from './header';
import { getPackageInfo } from './extensions';

/**
 * Extracts as much package information as available from a blob of RPM metadata.
 * Returns undefined if the package cannot be constructed due to missing or corrupt data.
 * @param data A blob of RPM metadata, as stored inside BerkeleyDB.
 */
export async function bufferToPackageInfo(
  data: Buffer,
): Promise<PackageInfo | undefined> {
  const entries = await headerImport(data);
  const packageInfo = await getPackageInfo(entries);

  return packageInfo;
}
