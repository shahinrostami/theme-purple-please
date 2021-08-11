/// <reference types="node" />
import { IndexEntry } from './types';
/**
 * Transform a blob of metadadata into addressable RPM package entries.
 * The entries need to be further processed to extract package information.
 * @param data A blob of RPM metadata, as stored inside BerkeleyDB.
 */
export declare function headerImport(data: Buffer): Promise<IndexEntry[]>;
