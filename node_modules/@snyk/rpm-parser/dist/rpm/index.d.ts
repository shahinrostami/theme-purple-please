/// <reference types="node" />
import { PackageInfo } from './types';
/**
 * Extracts as much package information as available from a blob of RPM metadata.
 * Returns undefined if the package cannot be constructed due to missing or corrupt data.
 * @param data A blob of RPM metadata, as stored inside BerkeleyDB.
 */
export declare function bufferToPackageInfo(data: Buffer): Promise<PackageInfo | undefined>;
