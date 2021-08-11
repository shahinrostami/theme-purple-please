import { IndexEntry, PackageInfo } from './types';
/**
 * Iterate through RPM metadata entries to build the full package data.
 * @param entries Entries that were previously extracted from a BerkeleyDB blob.
 */
export declare function getPackageInfo(entries: IndexEntry[]): Promise<PackageInfo | undefined>;
